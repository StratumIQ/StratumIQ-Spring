package com.stratumiq.backend.modules.manufacturer.mapper;

import com.stratumiq.backend.entity.Manufacturer;
import com.stratumiq.backend.modules.manufacturer.dto.CreateManufacturerRequest;
import com.stratumiq.backend.modules.manufacturer.dto.ManufacturerResponse;
import com.stratumiq.backend.modules.manufacturer.dto.UpdateManufacturerRequest;

public final class ManufacturerMapper {

    private ManufacturerMapper() {
    }

    public static Manufacturer toEntity(
            CreateManufacturerRequest request
    ) {

        return Manufacturer.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .active(request.getActive())
                .sortOrder(request.getSortOrder())
                .build();
    }

    public static void updateEntity(
            Manufacturer manufacturer,
            UpdateManufacturerRequest request
    ) {

        manufacturer.setName(request.getName().trim());
        manufacturer.setDescription(request.getDescription());

        if (request.getActive() != null) {
            manufacturer.setActive(request.getActive());
        }

        if (request.getSortOrder() != null) {
            manufacturer.setSortOrder(request.getSortOrder());
        }
    }

    public static ManufacturerResponse toResponse(
            Manufacturer manufacturer
    ) {

        return ManufacturerResponse.builder()
                .id(manufacturer.getId())
                .name(manufacturer.getName())
                .description(manufacturer.getDescription())
                .active(manufacturer.getActive())
                .sortOrder(manufacturer.getSortOrder())
                .createdAt(manufacturer.getCreatedAt())
                .updatedAt(manufacturer.getUpdatedAt())
                .build();
    }
}