package com.stratumiq.backend.modules.equipment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;

public record EquipmentCatalogResponse(
    @JsonProperty("equipment_id") String equipmentId,
    @JsonProperty("oem_id") Long oemId,
    String brand,
    String series,
    @JsonProperty("model_name") String modelName,
    @JsonProperty("equipment_type") String equipmentType,
    @JsonProperty("mobility_type") String mobilityType,
    @JsonProperty("application_stage") String applicationStage,
    @JsonProperty("hard_rock_rated") boolean hardRockRated,
    @JsonProperty("year_introduced") Integer yearIntroduced,
    String status,
    @JsonProperty("created_at") Instant createdAt,
    @JsonProperty("oem_name") String oemName
) {}