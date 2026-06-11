package com.stratumiq.backend.modules.fleet.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

// Replaces logOperationsSchema from fleet.validation.js
public record LogOperationRequest(

    @NotBlank(message = "event_type is required")
    String eventType,   // hours_update | downtime | note

    BigDecimal hoursLogged,      // required when eventType = hours_update
    String downtimeReason,   // required when eventType = downtime
    String note

) {}