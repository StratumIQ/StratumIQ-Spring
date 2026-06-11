package com.stratumiq.backend.modules.fleet.dto;

import java.math.BigDecimal;

import com.stratumiq.backend.common.enums.EquipmentCategory;
import com.stratumiq.backend.common.enums.EquipmentStatus;
import jakarta.validation.constraints.*;

// Replaces createEquipmentSchema from fleet.validation.js
public record CreateEquipmentRequest(

    @NotBlank(message = "Equipment name is required")
    @Size(min = 2, max = 120)
    String name,

    @NotNull(message = "Category is required")
    EquipmentCategory category,

    String serialNumber,
    String brand,
    String model,

    @Min(1950) @Max(2027)
    Integer makeYear,

    EquipmentStatus status,

    @DecimalMin("0.0")
    BigDecimal runningHours,

    String location,
    String engineType,
    String powerOutput,
    String capacity,
    String application,
    String attachments,
    String imageUrl,
    String documentUrl

) {}