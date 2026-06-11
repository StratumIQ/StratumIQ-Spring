package com.stratumiq.backend.security;

// Replaces req.user = { id, role } from your auth.middleware.js
// This is what @AuthenticationPrincipal gives you in every controller
public record AuthenticatedUser(
    Long userId,
    Long tenantId,
    String role
) {}