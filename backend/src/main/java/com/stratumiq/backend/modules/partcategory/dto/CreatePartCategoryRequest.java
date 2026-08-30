package com.stratumiq.backend.modules.partcategory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreatePartCategoryRequest {

    @NotBlank(message = "Category name is required.")
    @Size(max = 150)
    private String name;

    @Size(max = 500)
    private String description;

    private Boolean active = true;

    private Integer sortOrder = 0;

    private Long parentId;
}