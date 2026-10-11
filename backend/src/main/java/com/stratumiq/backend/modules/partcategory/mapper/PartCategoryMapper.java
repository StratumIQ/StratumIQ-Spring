package com.stratumiq.backend.modules.partcategory.mapper;

import com.stratumiq.backend.entity.PartCategory;
import com.stratumiq.backend.modules.partcategory.dto.CreatePartCategoryRequest;
import com.stratumiq.backend.modules.partcategory.dto.PartCategoryResponse;
import com.stratumiq.backend.modules.partcategory.dto.UpdatePartCategoryRequest;

public final class PartCategoryMapper {

    private PartCategoryMapper() {
    }

    public static PartCategory toEntity(
            CreatePartCategoryRequest request
    ) {

        return PartCategory.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .active(request.getActive())
                .sortOrder(request.getSortOrder())
                .build();
    }

    public static void updateEntity(
            PartCategory category,
            UpdatePartCategoryRequest request
    ) {

        category.setName(
                request.getName().trim()
        );

        category.setDescription(
                request.getDescription()
        );

        if (request.getActive() != null) {
            category.setActive(
                    request.getActive()
            );
        }

        if (request.getSortOrder() != null) {
            category.setSortOrder(
                    request.getSortOrder()
            );
        }
    }

    public static PartCategoryResponse toResponse(
            PartCategory category
    ) {

        return PartCategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .active(category.getActive())
                .sortOrder(category.getSortOrder())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .parentName(category.getParent() != null ? category.getParent().getName() : null)
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }

}