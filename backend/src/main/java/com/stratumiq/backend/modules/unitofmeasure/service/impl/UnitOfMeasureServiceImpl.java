package com.stratumiq.backend.modules.unitofmeasure.service.impl;

import com.stratumiq.backend.entity.UnitOfMeasure;
import com.stratumiq.backend.modules.unitofmeasure.dto.CreateUnitOfMeasureRequest;
import com.stratumiq.backend.modules.unitofmeasure.dto.UnitOfMeasureResponse;
import com.stratumiq.backend.modules.unitofmeasure.dto.UpdateUnitOfMeasureRequest;
import com.stratumiq.backend.modules.unitofmeasure.mapper.UnitOfMeasureMapper;
import com.stratumiq.backend.modules.unitofmeasure.service.UnitOfMeasureService;
import com.stratumiq.backend.repository.UnitOfMeasureRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UnitOfMeasureServiceImpl implements UnitOfMeasureService {

    private final UnitOfMeasureRepository repository;

    public UnitOfMeasureServiceImpl(
            UnitOfMeasureRepository repository
    ) {
        this.repository = repository;
    }

    @Override
    public UnitOfMeasureResponse create(
            CreateUnitOfMeasureRequest request
    ) {

        if (repository.existsByNameIgnoreCase(request.getName())) {
            throw new IllegalArgumentException(
                    "Unit already exists."
            );
        }

        UnitOfMeasure unit =
                UnitOfMeasureMapper.toEntity(request);

        unit = repository.save(unit);

        return UnitOfMeasureMapper.toResponse(unit);
    }

    @Override
    public UnitOfMeasureResponse update(
            Long unitId,
            UpdateUnitOfMeasureRequest request
    ) {

        UnitOfMeasure unit = repository.findById(unitId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Unit not found."
                        ));

        repository.findByNameIgnoreCase(request.getName())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(unitId)) {
                        throw new IllegalArgumentException(
                                "Unit already exists."
                        );
                    }
                });

        UnitOfMeasureMapper.updateEntity(
                unit,
                request
        );

        unit = repository.save(unit);

        return UnitOfMeasureMapper.toResponse(unit);
    }

    @Override
    public void delete(
            Long unitId
    ) {

        UnitOfMeasure unit = repository.findById(unitId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Unit not found."
                        ));

        unit.setActive(false);

        repository.save(unit);
    }

    @Override
    @Transactional(readOnly = true)
    public UnitOfMeasureResponse getById(
            Long unitId
    ) {

        UnitOfMeasure unit = repository.findById(unitId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Unit not found."
                        ));

        return UnitOfMeasureMapper.toResponse(unit);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UnitOfMeasureResponse> getAll() {

        return repository.findAll()
                .stream()
                .map(UnitOfMeasureMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UnitOfMeasureResponse> getActive() {

        return repository
                .findByActiveTrueOrderBySortOrderAscNameAsc()
                .stream()
                .map(UnitOfMeasureMapper::toResponse)
                .toList();
    }
}