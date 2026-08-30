package com.stratumiq.backend.modules.manufacturer.service;

import com.stratumiq.backend.modules.manufacturer.dto.CreateManufacturerRequest;
import com.stratumiq.backend.modules.manufacturer.dto.ManufacturerResponse;
import com.stratumiq.backend.modules.manufacturer.dto.UpdateManufacturerRequest;

import java.util.List;

public interface ManufacturerService {

    ManufacturerResponse create(CreateManufacturerRequest request);

    ManufacturerResponse update(
            Long manufacturerId,
            UpdateManufacturerRequest request
    );

    void delete(Long manufacturerId);

    ManufacturerResponse getById(Long manufacturerId);

    List<ManufacturerResponse> getAll();

    List<ManufacturerResponse> getActive();

}