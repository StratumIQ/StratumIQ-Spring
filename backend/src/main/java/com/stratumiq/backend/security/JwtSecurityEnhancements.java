package com.stratumiq.backend.security;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Component
public class JwtSecurityEnhancements {

    private final RedisTemplate<String, Object> redis;

    public JwtSecurityEnhancements(RedisTemplate<String, Object> redis) {
        this.redis = redis;
    }

    // Store refresh token with TTL (rotation storage)
    public void storeRefreshToken(String token, Long userId, Duration ttl) {
        String key = refreshKey(token);
        redis.opsForValue().set(key, String.valueOf(userId), ttl.getSeconds(), TimeUnit.SECONDS);
    }

    public boolean isRefreshTokenPresent(String token) {
        return redis.hasKey(refreshKey(token));
    }

    public void revokeRefreshToken(String token, Duration ttl) {
        // move token to revoked set for reuse detection, and remove active entry
        try {
            redis.delete(refreshKey(token));
        } catch (Exception ignore) {}
        // keep a marker to detect reuse for the same duration as the refresh token
        redis.opsForValue().set(revokedKey(token), "1", ttl.getSeconds(), TimeUnit.SECONDS);
    }

    public void revokeRefreshToken(String token) {
        revokeRefreshToken(token, Duration.ofHours(24));
    }

    // Blacklist access token until its expiry
    public void blacklistAccessToken(String token, long seconds) {
        redis.opsForValue().set(blacklistKey(token), "1", seconds, TimeUnit.SECONDS);
    }

    public boolean isBlacklisted(String token) {
        return Boolean.TRUE.equals(redis.hasKey(blacklistKey(token))) && redis.opsForValue().get(blacklistKey(token)) != null;
    }

    private String refreshKey(String token) { return "refresh:" + token; }
    private String blacklistKey(String token) { return "blacklist:" + token; }
    private String revokedKey(String token) { return "revoked_refresh:" + token; }

    public boolean isRefreshTokenRevoked(String token) {
        return Boolean.TRUE.equals(redis.hasKey(revokedKey(token))) && redis.opsForValue().get(revokedKey(token)) != null;
    }
}
