package com.stratumiq.backend.modules.activity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Map;

public record TrackActivityRequest(
    @NotBlank @Size(max = 80) String action,
    @Size(max = 50) String entityType,
    Long entityId,
    Map<String, Object> metadata
) {}
