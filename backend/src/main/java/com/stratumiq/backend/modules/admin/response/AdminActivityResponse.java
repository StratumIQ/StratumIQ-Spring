package com.stratumiq.backend.modules.admin.response;

import java.time.Instant;
import java.util.Map;

public record AdminActivityResponse(
    Long id,
    Long tenantId,
    Long userId,
    String userName,
    String userEmail,
    Long actorId,
    String actorName,
    String actorEmail,
    String action,
    String entityType,
    Long entityId,
    Map<String, Object> metadata,
    Instant createdAt
) {}
