package com.stratumiq.backend.modules.partbrand.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdatePartBrandRequest {

    @NotBlank(message = "Brand name is required.")
    @Size(max = 150)
    private String name;

    @Size(max = 500)
    private String description;

    private Boolean active;

    private Integer sortOrder;
}