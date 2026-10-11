package com.stratumiq.backend.modules.unitofmeasure.service;

import com.stratumiq.backend.modules.unitofmeasure.dto.CreateUnitOfMeasureRequest;
import com.stratumiq.backend.modules.unitofmeasure.dto.UnitOfMeasureResponse;
import com.stratumiq.backend.modules.unitofmeasure.dto.UpdateUnitOfMeasureRequest;

import java.util.List;

public interface UnitOfMeasureService {

    UnitOfMeasureResponse create(
            CreateUnitOfMeasureRequest request
    );

    UnitOfMeasureResponse update(
            Long unitId,
            UpdateUnitOfMeasureRequest request
    );

    void delete(
            Long unitId
    );

    UnitOfMeasureResponse getById(
            Long unitId
    );

    List<UnitOfMeasureResponse> getAll();

    List<UnitOfMeasureResponse> getActive();

}