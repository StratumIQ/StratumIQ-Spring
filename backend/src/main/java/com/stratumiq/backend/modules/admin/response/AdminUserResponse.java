package com.stratumiq.backend.modules.admin.response;

import java.time.Instant;

public record AdminUserResponse(
    Long id,
    String firstName,
    String lastName,
    String email,
    String phone,
    String role,
    String status,
    Long tenantId,
    Boolean emailVerified,
    Boolean phoneVerified,
    Instant createdAt,
    Instant lastLoginAt
) {}
