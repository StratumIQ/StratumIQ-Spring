package com.stratumiq.backend.modules.partbrand.service;

import com.stratumiq.backend.modules.partbrand.dto.CreatePartBrandRequest;
import com.stratumiq.backend.modules.partbrand.dto.PartBrandResponse;
import com.stratumiq.backend.modules.partbrand.dto.UpdatePartBrandRequest;

import java.util.List;

public interface PartBrandService {

    PartBrandResponse create(
            CreatePartBrandRequest request
    );

    PartBrandResponse update(
            Long brandId,
            UpdatePartBrandRequest request
    );

    void delete(
            Long brandId
    );

    PartBrandResponse getById(
            Long brandId
    );

    List<PartBrandResponse> getAll();

    List<PartBrandResponse> getActive();

}