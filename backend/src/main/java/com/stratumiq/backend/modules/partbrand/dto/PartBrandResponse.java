package com.stratumiq.backend.modules.partbrand.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class PartBrandResponse {

    private Long id;

    private String name;

    private String description;

    private Boolean active;

    private Integer sortOrder;

    private Instant createdAt;

    private Instant updatedAt;
}