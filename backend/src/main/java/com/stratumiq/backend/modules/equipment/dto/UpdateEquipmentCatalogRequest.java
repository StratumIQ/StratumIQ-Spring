package com.stratumiq.backend.modules.equipment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record UpdateEquipmentCatalogRequest(
    @JsonProperty("oem_id") @Positive Long oemId,
    @Size(max = 120) String brand,
    @Size(max = 120) String series,
    @JsonProperty("model_name") @Size(max = 120) String modelName,
    @JsonProperty("equipment_type")
    @Pattern(regexp = "jaw_crusher|cone_crusher|hsi_crusher|vsi_crusher|gyratory_crusher|screen|feeder|conveyor")
    String equipmentType,
    @JsonProperty("mobility_type")
    @Pattern(regexp = "static|track|wheel|portable|modular")
    String mobilityType,
    @JsonProperty("application_stage") @Size(max = 120) String applicationStage,
    @JsonProperty("hard_rock_rated") Boolean hardRockRated,
    @JsonProperty("year_introduced") @Min(1901) @Max(2100) Integer yearIntroduced,
    @Pattern(regexp = "active|discontinued|draft") String status
) {}