package com.stratumiq.backend.security;

import org.springframework.stereotype.Component;
import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * JWT Security Enhancements — token lifecycle management.
 * 
 * Replaces Redis-based token storage with in-memory TokenStorageService.
 * 
 * Responsibilities:
 * - Blacklist revoked access tokens
 * - Store and validate refresh tokens
 * - Detect refresh token reuse (security threat)
 * - Implement brute-force protection
 * 
 * NOTE: This is suitable for single-instance production deployments.
 * For clustered deployments, use distributed cache (Redis/Memcached).
 */
@Component
public class JwtSecurityEnhancements {

    private static final Logger logger = LoggerFactory.getLogger(JwtSecurityEnhancements.class);
    private final TokenStorageService tokenStorage;

    public JwtSecurityEnhancements(TokenStorageService tokenStorage) {
        this.tokenStorage = tokenStorage;
    }

    /**
     * Store a refresh token in active storage.
     * 
     * @param token the refresh token
     * @param userId the user ID who owns this token
     * @param ttl time-to-live duration
     */
    public void storeRefreshToken(String token, Long userId, Duration ttl) {
        tokenStorage.storeRefreshToken(token, userId, ttl.getSeconds());
        logger.debug("Stored refresh token for user {}", userId);
    }

    /**
     * Check if a refresh token is currently active (not revoked/expired).
     * 
     * @param token the refresh token to check
     * @return true if token is in active storage
     */
    public boolean isRefreshTokenPresent(String token) {
        return tokenStorage.isRefreshTokenPresent(token);
    }

    /**
     * Revoke a refresh token to prevent reuse.
     * 
     * Moves token from active storage to revoked list.
     * Reuse detection works for the entire TTL period.
     * 
     * @param token the token to revoke
     * @param ttl how long to keep the revocation record
     */
    public void revokeRefreshToken(String token, Duration ttl) {
        try {
            tokenStorage.revokeRefreshToken(token, ttl.getSeconds());
            logger.info("Revoked refresh token");
        } catch (Exception e) {
            logger.error("Error revoking refresh token", e);
            // Don't fail the logout if revocation fails
        }
    }

    /**
     * Revoke a refresh token with default 24-hour TTL.
     * 
     * @param token the token to revoke
     */
    public void revokeRefreshToken(String token) {
        revokeRefreshToken(token, Duration.ofHours(24));
    }

    /**
     * Check if a refresh token has been explicitly revoked.
     * 
     * @param token the token to check
     * @return true if token is in revocation list
     */
    public boolean isRefreshTokenRevoked(String token) {
        return tokenStorage.isRefreshTokenRevoked(token);
    }

    /**
     * Blacklist an access token (mark as revoked).
     * 
     * Used when user logs out or token is compromised.
     * Blacklist entries expire with the token's expiry time.
     * 
     * @param token the access token to blacklist
     * @param seconds how long to keep it in blacklist (token expiry time)
     */
    public void blacklistAccessToken(String token, long seconds) {
        tokenStorage.blacklistAccessToken(token, seconds);
        logger.info("Blacklisted access token, expires in {} seconds", seconds);
    }

    /**
     * Check if an access token has been blacklisted.
     * 
     * @param token the token to check
     * @return true if token is blacklisted and not yet expired
     */
    public boolean isBlacklisted(String token) {
        return tokenStorage.isAccessTokenBlacklisted(token);
    }
}

