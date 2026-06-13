package com.stratumiq.backend.modules.admin.response;

import java.time.Instant;
import java.util.Map;

public record AdminActivityResponse(
    Long id,
    String action,
    String entityType,
    Long entityId,
    Map<String, Object> metadata,
    Instant createdAt
) {}
