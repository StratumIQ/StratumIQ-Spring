package com.stratumiq.backend.modules.partbrand.service.impl;

import com.stratumiq.backend.entity.PartBrand;
import com.stratumiq.backend.modules.partbrand.dto.CreatePartBrandRequest;
import com.stratumiq.backend.modules.partbrand.dto.PartBrandResponse;
import com.stratumiq.backend.modules.partbrand.dto.UpdatePartBrandRequest;
import com.stratumiq.backend.modules.partbrand.mapper.PartBrandMapper;
import com.stratumiq.backend.modules.partbrand.service.PartBrandService;
import com.stratumiq.backend.repository.PartBrandRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class PartBrandServiceImpl implements PartBrandService {

    private final PartBrandRepository repository;

    public PartBrandServiceImpl(
            PartBrandRepository repository
    ) {
        this.repository = repository;
    }

    @Override
    public PartBrandResponse create(CreatePartBrandRequest request) {

        if (repository.existsByNameIgnoreCase(request.getName())) {
            throw new IllegalArgumentException("Brand already exists.");
        }

        PartBrand brand = PartBrandMapper.toEntity(request);

        brand = repository.save(brand);

        return PartBrandMapper.toResponse(brand);
    }

    @Override
    public PartBrandResponse update(
            Long brandId,
            UpdatePartBrandRequest request
    ) {

        PartBrand brand = repository.findById(brandId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Brand not found."));

        repository.findByNameIgnoreCase(request.getName())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(brandId)) {
                        throw new IllegalArgumentException("Brand already exists.");
                    }
                });

        PartBrandMapper.updateEntity(brand, request);

        brand = repository.save(brand);

        return PartBrandMapper.toResponse(brand);
    }

    @Override
    public void delete(Long brandId) {

        PartBrand brand = repository.findById(brandId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Brand not found."));

        brand.setActive(false);

        repository.save(brand);
    }

    @Override
    @Transactional(readOnly = true)
    public PartBrandResponse getById(Long brandId) {

        return repository.findById(brandId)
                .map(PartBrandMapper::toResponse)
                .orElseThrow(() ->
                        new EntityNotFoundException("Brand not found."));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PartBrandResponse> getAll() {

        return repository.findAll()
                .stream()
                .map(PartBrandMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PartBrandResponse> getActive() {

        return repository.findByActiveTrueOrderBySortOrderAscNameAsc()
                .stream()
                .map(PartBrandMapper::toResponse)
                .toList();
    }
}