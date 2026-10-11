package com.stratumiq.backend.modules.partcategory.service.impl;

import com.stratumiq.backend.entity.PartCategory;
import com.stratumiq.backend.modules.partcategory.dto.CreatePartCategoryRequest;
import com.stratumiq.backend.modules.partcategory.dto.PartCategoryResponse;
import com.stratumiq.backend.modules.partcategory.dto.UpdatePartCategoryRequest;
import com.stratumiq.backend.modules.partcategory.mapper.PartCategoryMapper;
import com.stratumiq.backend.modules.partcategory.service.PartCategoryService;
import com.stratumiq.backend.repository.PartCategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class PartCategoryServiceImpl implements PartCategoryService {

    private final PartCategoryRepository repository;

    public PartCategoryServiceImpl(
            PartCategoryRepository repository
    ) {
        this.repository = repository;
    }

    @Override
    public PartCategoryResponse create(
            CreatePartCategoryRequest request
    ) {

        if (repository.existsByNameIgnoreCase(request.getName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Category already exists.");
        }

        PartCategory category = PartCategoryMapper.toEntity(request);
        category.setParent(resolveParent(request.getParentId(), null));
        category = repository.save(category);

        return PartCategoryMapper.toResponse(category);
    }

    @Override
    public PartCategoryResponse update(
            Long categoryId,
            UpdatePartCategoryRequest request
    ) {

        PartCategory category = repository.findById(categoryId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Category not found."
                        ));

        repository.findByNameIgnoreCase(request.getName())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(categoryId)) {
                        throw new ResponseStatusException(HttpStatus.CONFLICT, "Category already exists.");
                    }
                });

        PartCategoryMapper.updateEntity(category, request);
        category.setParent(resolveParent(request.getParentId(), categoryId));
        category = repository.save(category);

        return PartCategoryMapper.toResponse(category);
    }

    @Override
    public void delete(
            Long categoryId
    ) {

        PartCategory category = repository.findById(categoryId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Category not found."
                        ));

        category.setActive(false);

        repository.save(category);
    }

    @Override
    @Transactional(readOnly = true)
    public PartCategoryResponse getById(
            Long categoryId
    ) {

        PartCategory category = repository.findById(categoryId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Category not found."
                        ));

        return PartCategoryMapper.toResponse(category);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PartCategoryResponse> getAll() {

        return repository.findAll()
                .stream()
                .map(PartCategoryMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PartCategoryResponse> getActive() {

        return repository.findByActiveTrueOrderBySortOrderAscNameAsc()
                .stream()
                .map(PartCategoryMapper::toResponse)
                .toList();
    }

    private PartCategory resolveParent(Long parentId, Long selfId) {
        if (parentId == null) {
            return null;
        }
        if (selfId != null && parentId.equals(selfId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category cannot be its own parent.");
        }
        PartCategory parent = repository.findById(parentId)
                .orElseThrow(() -> new EntityNotFoundException("Parent category not found."));
        if (parent.getParent() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only one subcategory level is supported.");
        }
        return parent;
    }

}