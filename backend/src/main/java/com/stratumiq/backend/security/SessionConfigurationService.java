package com.stratumiq.backend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Centralized session and timeout configuration
 * All timeout values are externalized to application.yml for easy adjustment
 * without redeployment
 */
@Service
public class SessionConfigurationService {

    private static final Logger logger = LoggerFactory.getLogger(SessionConfigurationService.class);

    @Value("${jwt.access.expiration:1800000}")
    private long accessTokenExpiryMs;

    @Value("${jwt.refresh.expiration:604800000}")
    private long refreshTokenExpiryMs;

    @Value("${session.idle-timeout:1500000}")
    private long idleTimeoutMs;

    @Value("${session.warning-time:300000}")
    private long warningTimeMs;

    @Value("${session.remember-me-duration:2592000000}")
    private long rememberMeDurationMs;

    @Value("${session.max-invalid-attempts:5}")
    private int maxInvalidAttempts;

    @Value("${session.token-rotation-enabled:true}")
    private boolean tokenRotationEnabled;

    /**
     * Access token expiry (in milliseconds)
     * Default: 30 minutes (1800000ms)
     */
    public long getAccessTokenExpiryMs() {
        return accessTokenExpiryMs;
    }

    /**
     * Refresh token expiry (in milliseconds)
     * Default: 7 days (604800000ms)
     * Extended to 30 days if Remember Me is enabled
     */
    public long getRefreshTokenExpiryMs(boolean rememberMe) {
        return rememberMe ? rememberMeDurationMs : refreshTokenExpiryMs;
    }

    /**
     * Idle timeout threshold (in milliseconds)
     * After this duration with no activity, show warning
     * Default: 25 minutes (1500000ms)
     */
    public long getIdleTimeoutMs() {
        return idleTimeoutMs;
    }

    /**
     * Warning duration before auto-logout (in milliseconds)
     * After idle timeout, user has this long to stay logged in
     * Default: 5 minutes (300000ms)
     */
    public long getWarningTimeMs() {
        return warningTimeMs;
    }

    /**
     * Total session timeout (idle + warning)
     */
    public long getTotalSessionTimeoutMs() {
        return idleTimeoutMs + warningTimeMs;
    }

    /**
     * Remember Me duration (in milliseconds)
     * Default: 30 days (2592000000ms)
     */
    public long getRememberMeDurationMs() {
        return rememberMeDurationMs;
    }

    /**
     * Maximum invalid refresh attempts before forcing logout
     * Default: 5
     */
    public int getMaxInvalidAttempts() {
        return maxInvalidAttempts;
    }

    /**
     * Is token rotation enabled?
     * When true, refresh token is replaced with each refresh
     */
    public boolean isTokenRotationEnabled() {
        return tokenRotationEnabled;
    }

    /**
     * Log configuration on startup (for debugging)
     */
    public void logConfiguration() {
        logger.info("╔═══════════════════════════════════════════════════════════╗");
        logger.info("║        SESSION & TIMEOUT CONFIGURATION (Enterprise)        ║");
        logger.info("╠═══════════════════════════════════════════════════════════╣");
        logger.info("║ Access Token Expiry:  {} ms ({} min)", accessTokenExpiryMs, accessTokenExpiryMs / 60000);
        logger.info("║ Refresh Token Expiry: {} ms ({} days)", refreshTokenExpiryMs, refreshTokenExpiryMs / 86400000);
        logger.info("║ Idle Timeout:         {} ms ({} min)", idleTimeoutMs, idleTimeoutMs / 60000);
        logger.info("║ Warning Duration:     {} ms ({} sec)", warningTimeMs, warningTimeMs / 1000);
        logger.info("║ Remember Me Duration: {} ms ({} days)", rememberMeDurationMs, rememberMeDurationMs / 86400000);
        logger.info("║ Token Rotation:       {}", tokenRotationEnabled ? "ENABLED" : "DISABLED");
        logger.info("╚═══════════════════════════════════════════════════════════╝");
    }
}
