package com.stratumiq.backend.security;

import org.springframework.stereotype.Component;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * In-memory token storage service — replaces Redis for token blacklist and storage.
 * 
 * Used for:
 * - Access token blacklist (revoked tokens)
 * - Refresh token storage (active tokens)
 * - Login failure counters (brute-force protection)
 * 
 * NOTE: Data is NOT persistent. On application restart, all counters are reset.
 * This is acceptable for production single-instance deployments.
 * 
 * For clustered deployments, implement using:
 * - Database (preferred for audit trail)
 * - Distributed cache (Memcached/Redis)
 * - Consensus store (etcd)
 */
@Component
public class TokenStorageService {

    private static final Logger logger = LoggerFactory.getLogger(TokenStorageService.class);

    // Access token blacklist: token -> expiry timestamp (ms)
    private final ConcurrentHashMap<String, Long> blacklistAccessTokens = new ConcurrentHashMap<>();

    // Refresh token storage: token -> userId
    private final ConcurrentHashMap<String, Long> refreshTokens = new ConcurrentHashMap<>();

    // Revoked refresh tokens: token -> revocation timestamp (ms)
    private final ConcurrentHashMap<String, Long> revokedRefreshTokens = new ConcurrentHashMap<>();

    // Failed login attempts: email -> FailedLoginAttempt
    private final ConcurrentHashMap<String, FailedLoginAttempt> failedLoginAttempts = new ConcurrentHashMap<>();

    // Account lockouts: email -> lockout expiry (ms)
    private final ConcurrentHashMap<String, Long> accountLockouts = new ConcurrentHashMap<>();

    public TokenStorageService() {
        // Start background cleanup task every 5 minutes
        ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1, r -> {
            Thread t = new Thread(r, "TokenStorageCleanup");
            t.setDaemon(true);
            return t;
        });

        scheduler.scheduleAtFixedRate(
            this::cleanupExpiredEntries,
            5,  // initial delay
            5,  // period
            TimeUnit.MINUTES
        );
    }

    // ────────────────────────────────────────────────────────────────────────
    // ACCESS TOKEN BLACKLIST (revoked tokens)
    // ────────────────────────────────────────────────────────────────────────

    public void blacklistAccessToken(String token, long expirySeconds) {
        long expiryMs = System.currentTimeMillis() + (expirySeconds * 1000L);
        blacklistAccessTokens.put(token, expiryMs);
        logger.debug("Blacklisted access token, expires in {} seconds", expirySeconds);
    }

    public boolean isAccessTokenBlacklisted(String token) {
        Long expiry = blacklistAccessTokens.get(token);
        if (expiry == null) {
            return false;  // not in blacklist
        }

        long now = System.currentTimeMillis();
        if (expiry < now) {
            // token has expired, remove from blacklist
            blacklistAccessTokens.remove(token);
            return false;
        }

        return true;  // token is blacklisted and still valid
    }

    // ────────────────────────────────────────────────────────────────────────
    // REFRESH TOKEN STORAGE
    // ────────────────────────────────────────────────────────────────────────

    public void storeRefreshToken(String token, Long userId, long ttlSeconds) {
        refreshTokens.put(token, userId);
        logger.debug("Stored refresh token for user {}, TTL {} seconds", userId, ttlSeconds);
    }

    public boolean isRefreshTokenPresent(String token) {
        return refreshTokens.containsKey(token);
    }

    public Long getRefreshTokenUserId(String token) {
        return refreshTokens.get(token);
    }

    public void removeRefreshToken(String token) {
        refreshTokens.remove(token);
        logger.debug("Removed refresh token from storage");
    }

    // ────────────────────────────────────────────────────────────────────────
    // REFRESH TOKEN REVOCATION (token reuse detection)
    // ────────────────────────────────────────────────────────────────────────

    public void revokeRefreshToken(String token, long ttlSeconds) {
        removeRefreshToken(token);  // remove from active storage
        long expiryMs = System.currentTimeMillis() + (ttlSeconds * 1000L);
        revokedRefreshTokens.put(token, expiryMs);
        logger.debug("Revoked refresh token, kept in revocation list for {} seconds", ttlSeconds);
    }

    public boolean isRefreshTokenRevoked(String token) {
        Long expiry = revokedRefreshTokens.get(token);
        if (expiry == null) {
            return false;  // not revoked
        }

        long now = System.currentTimeMillis();
        if (expiry < now) {
            // revocation record has expired, clean up
            revokedRefreshTokens.remove(token);
            return false;
        }

        return true;  // token is revoked and revocation is still active
    }

    // ────────────────────────────────────────────────────────────────────────
    // LOGIN FAILURE TRACKING (brute-force protection)
    // ────────────────────────────────────────────────────────────────────────

    public void recordFailedLogin(String email) {
        failedLoginAttempts.compute(email, (k, v) -> {
            if (v == null) {
                return new FailedLoginAttempt(1, System.currentTimeMillis());
            } else {
                v.attempts++;
                return v;
            }
        });
        logger.debug("Recorded failed login attempt for email: {}", email);
    }

    public int getFailedLoginCount(String email) {
        FailedLoginAttempt attempt = failedLoginAttempts.get(email);
        if (attempt == null) {
            return 0;
        }

        // Reset counter if older than 1 hour
        if (System.currentTimeMillis() - attempt.timestamp > 3600000L) {
            failedLoginAttempts.remove(email);
            return 0;
        }

        return attempt.attempts;
    }

    public void clearFailedLoginCount(String email) {
        failedLoginAttempts.remove(email);
        logger.debug("Cleared failed login counter for email: {}", email);
    }

    // ────────────────────────────────────────────────────────────────────────
    // ACCOUNT LOCKOUTS
    // ────────────────────────────────────────────────────────────────────────

    public void lockAccount(String email, long lockDurationSeconds) {
        long expiryMs = System.currentTimeMillis() + (lockDurationSeconds * 1000L);
        accountLockouts.put(email, expiryMs);
        logger.warn("Locked account {}, duration: {} seconds", email, lockDurationSeconds);
    }

    public boolean isAccountLocked(String email) {
        Long expiry = accountLockouts.get(email);
        if (expiry == null) {
            return false;  // not locked
        }

        long now = System.currentTimeMillis();
        if (expiry < now) {
            // lockout has expired, remove it
            accountLockouts.remove(email);
            return false;
        }

        return true;  // account is locked
    }

    public void unlockAccount(String email) {
        accountLockouts.remove(email);
        logger.info("Unlocked account: {}", email);
    }

    // ────────────────────────────────────────────────────────────────────────
    // CLEANUP
    // ────────────────────────────────────────────────────────────────────────

    private void cleanupExpiredEntries() {
        long now = System.currentTimeMillis();
        int cleaned = 0;

        // Clean blacklisted access tokens
        blacklistAccessTokens.entrySet().removeIf(e -> e.getValue() < now);

        // Clean revoked refresh tokens
        revokedRefreshTokens.entrySet().removeIf(e -> e.getValue() < now);

        // Clean account lockouts
        accountLockouts.entrySet().removeIf(e -> e.getValue() < now);

        // Clean failed login attempts older than 1 hour
        long oneHourAgo = now - 3600000L;
        failedLoginAttempts.entrySet().removeIf(e -> e.getValue().timestamp < oneHourAgo);

        logger.debug("Token storage cleanup: removed {} expired entries", cleaned);
    }

    // Helper class for tracking failed login attempts
    private static class FailedLoginAttempt {
        int attempts;
        long timestamp;

        FailedLoginAttempt(int attempts, long timestamp) {
            this.attempts = attempts;
            this.timestamp = timestamp;
        }
    }
}
