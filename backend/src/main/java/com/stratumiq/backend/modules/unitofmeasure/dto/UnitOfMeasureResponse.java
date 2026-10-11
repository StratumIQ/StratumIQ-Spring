package com.stratumiq.backend.modules.unitofmeasure.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class UnitOfMeasureResponse {

    private Long id;

    private String name;

    private String symbol;

    private String description;

    private Boolean active;

    private Integer sortOrder;

    private Instant createdAt;

    private Instant updatedAt;
}