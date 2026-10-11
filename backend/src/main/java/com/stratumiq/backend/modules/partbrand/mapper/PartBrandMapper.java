package com.stratumiq.backend.modules.partbrand.mapper;

import com.stratumiq.backend.entity.PartBrand;
import com.stratumiq.backend.modules.partbrand.dto.CreatePartBrandRequest;
import com.stratumiq.backend.modules.partbrand.dto.PartBrandResponse;
import com.stratumiq.backend.modules.partbrand.dto.UpdatePartBrandRequest;

public final class PartBrandMapper {

    private PartBrandMapper() {
    }

    public static PartBrand toEntity(
            CreatePartBrandRequest request
    ) {

        return PartBrand.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .active(request.getActive())
                .sortOrder(request.getSortOrder())
                .build();
    }

    public static void updateEntity(
            PartBrand brand,
            UpdatePartBrandRequest request
    ) {

        brand.setName(
                request.getName().trim()
        );

        brand.setDescription(
                request.getDescription()
        );

        if (request.getActive() != null) {
            brand.setActive(
                    request.getActive()
            );
        }

        if (request.getSortOrder() != null) {
            brand.setSortOrder(
                    request.getSortOrder()
            );
        }
    }

    public static PartBrandResponse toResponse(
            PartBrand brand
    ) {

        return PartBrandResponse.builder()
                .id(brand.getId())
                .name(brand.getName())
                .description(brand.getDescription())
                .active(brand.getActive())
                .sortOrder(brand.getSortOrder())
                .createdAt(brand.getCreatedAt())
                .updatedAt(brand.getUpdatedAt())
                .build();
    }

}