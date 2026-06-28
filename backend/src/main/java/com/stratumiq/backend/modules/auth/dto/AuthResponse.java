package com.stratumiq.backend.modules.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Enterprise-grade session response with comprehensive timeout metadata
 * Consumed by frontend to manage automatic refresh and idle warnings
 */
public record AuthResponse(
    @JsonProperty("access_token")
    String accessToken,

    @JsonProperty("refresh_token")
    String refreshToken,

    @JsonProperty("token_type")
    String tokenType,

    @JsonProperty("expires_in")
    Long expiresIn,

    // Session management metadata
    @JsonProperty("session_timeout_ms")
    Long sessionTimeoutMs,

    @JsonProperty("idle_warning_time_ms")
    Long idleWarningTimeMs,

    @JsonProperty("token_rotation_enabled")
    Boolean tokenRotationEnabled,

    @JsonProperty("user_id")
    Long userId,

    @JsonProperty("email")
    String email,

    @JsonProperty("role")
    String role

) {
    public static AuthResponse of(
            String accessToken,
            String refreshToken,
            Long accessExpiryMs,
            Long sessionTimeoutMs,
            Long idleWarningTimeMs,
            Boolean tokenRotationEnabled,
            Long userId,
            String email,
            String role) {
        return new AuthResponse(
            accessToken,
            refreshToken,
            "Bearer",
            accessExpiryMs,
            sessionTimeoutMs,
            idleWarningTimeMs,
            tokenRotationEnabled,
            userId,
            email,
            role
        );
    }
}
