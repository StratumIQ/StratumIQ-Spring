package com.stratumiq.backend.modules.partcategory.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class PartCategoryResponse {

    private Long id;

    private String name;

    private String description;

    private Boolean active;

    private Integer sortOrder;

    private Long parentId;

    private String parentName;

    private Instant createdAt;

    private Instant updatedAt;

}