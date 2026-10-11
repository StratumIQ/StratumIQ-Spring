package com.stratumiq.backend.modules.manufacturer.service.impl;

import com.stratumiq.backend.entity.Manufacturer;
import com.stratumiq.backend.modules.manufacturer.dto.CreateManufacturerRequest;
import com.stratumiq.backend.modules.manufacturer.dto.ManufacturerResponse;
import com.stratumiq.backend.modules.manufacturer.dto.UpdateManufacturerRequest;
import com.stratumiq.backend.modules.manufacturer.mapper.ManufacturerMapper;
import com.stratumiq.backend.modules.manufacturer.service.ManufacturerService;
import com.stratumiq.backend.repository.ManufacturerRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ManufacturerServiceImpl implements ManufacturerService {

    private final ManufacturerRepository repository;

    public ManufacturerServiceImpl(
            ManufacturerRepository repository
    ) {
        this.repository = repository;
    }

    @Override
    public ManufacturerResponse create(
            CreateManufacturerRequest request
    ) {

        if (repository.existsByNameIgnoreCase(request.getName())) {
            throw new IllegalArgumentException(
                    "Manufacturer already exists."
            );
        }

        Manufacturer manufacturer =
                ManufacturerMapper.toEntity(request);

        manufacturer = repository.save(manufacturer);

        return ManufacturerMapper.toResponse(manufacturer);
    }

    @Override
    public ManufacturerResponse update(
            Long manufacturerId,
            UpdateManufacturerRequest request
    ) {

        Manufacturer manufacturer = repository.findById(manufacturerId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Manufacturer not found."
                        ));

        repository.findByNameIgnoreCase(request.getName())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(manufacturerId)) {
                        throw new IllegalArgumentException(
                                "Manufacturer already exists."
                        );
                    }
                });

        ManufacturerMapper.updateEntity(
                manufacturer,
                request
        );

        manufacturer = repository.save(manufacturer);

        return ManufacturerMapper.toResponse(manufacturer);
    }

    @Override
    public void delete(
            Long manufacturerId
    ) {

        Manufacturer manufacturer = repository.findById(manufacturerId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Manufacturer not found."
                        ));

        manufacturer.setActive(false);

        repository.save(manufacturer);
    }

    @Override
    @Transactional(readOnly = true)
    public ManufacturerResponse getById(
            Long manufacturerId
    ) {

        Manufacturer manufacturer = repository.findById(manufacturerId)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Manufacturer not found."
                        ));

        return ManufacturerMapper.toResponse(manufacturer);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ManufacturerResponse> getAll() {

        return repository.findAll()
                .stream()
                .map(ManufacturerMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ManufacturerResponse> getActive() {

        return repository.findByActiveTrueOrderBySortOrderAscNameAsc()
                .stream()
                .map(ManufacturerMapper::toResponse)
                .toList();
    }
}