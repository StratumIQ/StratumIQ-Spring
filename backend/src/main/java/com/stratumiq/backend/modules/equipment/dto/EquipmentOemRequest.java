package com.stratumiq.backend.modules.equipment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Size;

public record EquipmentOemRequest(
    @Size(max = 150) String name,
    @Size(max = 100) String country,
    @Size(max = 500) String website,
    @JsonProperty("logo_url") @Size(max = 2048) String logoUrl
) {}