package com.stratumiq.backend.modules.unitofmeasure.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateUnitOfMeasureRequest {

    @NotBlank(message = "Unit name is required.")
    @Size(max = 100)
    private String name;

    @Size(max = 20)
    private String symbol;

    @Size(max = 500)
    private String description;

    private Boolean active;

    private Integer sortOrder;
}