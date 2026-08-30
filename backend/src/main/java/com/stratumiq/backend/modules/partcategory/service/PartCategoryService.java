package com.stratumiq.backend.modules.partcategory.service;

import com.stratumiq.backend.modules.partcategory.dto.CreatePartCategoryRequest;
import com.stratumiq.backend.modules.partcategory.dto.PartCategoryResponse;
import com.stratumiq.backend.modules.partcategory.dto.UpdatePartCategoryRequest;

import java.util.List;

public interface PartCategoryService {

    PartCategoryResponse create(
            CreatePartCategoryRequest request
    );

    PartCategoryResponse update(
            Long categoryId,
            UpdatePartCategoryRequest request
    );

    void delete(
            Long categoryId
    );

    PartCategoryResponse getById(
            Long categoryId
    );

    List<PartCategoryResponse> getAll();

    List<PartCategoryResponse> getActive();

}