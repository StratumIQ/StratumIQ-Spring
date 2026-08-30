package com.stratumiq.backend.modules.unitofmeasure.mapper;

import com.stratumiq.backend.entity.UnitOfMeasure;
import com.stratumiq.backend.modules.unitofmeasure.dto.CreateUnitOfMeasureRequest;
import com.stratumiq.backend.modules.unitofmeasure.dto.UnitOfMeasureResponse;
import com.stratumiq.backend.modules.unitofmeasure.dto.UpdateUnitOfMeasureRequest;

public final class UnitOfMeasureMapper {

    private UnitOfMeasureMapper() {
    }

    public static UnitOfMeasure toEntity(CreateUnitOfMeasureRequest request) {

        return UnitOfMeasure.builder()
                .name(request.getName().trim())
                .symbol(request.getSymbol())
                .description(request.getDescription())
                .active(request.getActive())
                .sortOrder(request.getSortOrder())
                .build();
    }

    public static void updateEntity(
            UnitOfMeasure unit,
            UpdateUnitOfMeasureRequest request
    ) {

        unit.setName(request.getName().trim());
        unit.setSymbol(request.getSymbol());
        unit.setDescription(request.getDescription());

        if (request.getActive() != null) {
            unit.setActive(request.getActive());
        }

        if (request.getSortOrder() != null) {
            unit.setSortOrder(request.getSortOrder());
        }
    }

    public static UnitOfMeasureResponse toResponse(UnitOfMeasure unit) {

        return UnitOfMeasureResponse.builder()
                .id(unit.getId())
                .name(unit.getName())
                .symbol(unit.getSymbol())
                .description(unit.getDescription())
                .active(unit.getActive())
                .sortOrder(unit.getSortOrder())
                .createdAt(unit.getCreatedAt())
                .updatedAt(unit.getUpdatedAt())
                .build();
    }
}