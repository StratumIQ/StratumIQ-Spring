package com.stratumiq.backend.modules.manufacturer.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ManufacturerResponse {

    private Long id;

    private String name;

    private String description;

    private Boolean active;

    private Integer sortOrder;

    private Instant createdAt;

    private Instant updatedAt;
}