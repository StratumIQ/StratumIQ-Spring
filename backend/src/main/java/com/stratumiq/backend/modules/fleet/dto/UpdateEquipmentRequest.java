package com.stratumiq.backend.modules.fleet.dto;

import com.stratumiq.backend.common.enums.EquipmentCategory;
import com.stratumiq.backend.common.enums.EquipmentStatus;
import java.math.BigDecimal;

// Replaces updateEquipmentSchema — all fields optional (partial update)
public record UpdateEquipmentRequest(
    String name,
    EquipmentCategory category,
    String serialNumber,
    String brand,
    String model,
    Integer makeYear,
    EquipmentStatus status,
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