package com.stratumiq.backend.modules.equipment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;

public record EquipmentOemResponse(
    @JsonProperty("oem_id") Long oemId,
    String name,
    String country,
    String website,
    @JsonProperty("logo_url") String logoUrl,
    @JsonProperty("created_at") Instant createdAt
) {}