package com.stratumiq.backend.modules.fleet.dto;

import com.stratumiq.backend.common.enums.MaintenanceStatus;
import com.stratumiq.backend.common.enums.MaintenanceType;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

// Replaces createServiceRecordSchema from fleet.validation.js
public record CreateServiceRecordRequest(

    @NotBlank(message = "Title is required")
    @Size(min = 2, max = 200)
    String title,

    @NotNull(message = "Service type is required")
    MaintenanceType serviceType,

    MaintenanceStatus status,
    String description,
    String technicianName,
    LocalDate serviceDate,
    Double hoursAtService,
    BigDecimal cost,
    String partsUsed,
    LocalDate nextServiceDate,
    BigDecimal nextServiceHours

) {}