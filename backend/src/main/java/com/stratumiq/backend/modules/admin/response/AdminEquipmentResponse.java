package com.stratumiq.backend.modules.admin.response;

import java.math.BigDecimal;
import java.time.Instant;

public record AdminEquipmentResponse(
    Long id,
    Long ownerId,
    String ownerName,
    String ownerEmail,
    String name,
    String category,
    String serialNumber,
    String brand,
    String model,
    String status,
    BigDecimal runningHours,
    String location,
    Instant createdAt,
    Instant updatedAt
) {}
