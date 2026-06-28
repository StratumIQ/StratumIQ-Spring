package com.stratumiq.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;

// Replaces your entire utils/jwt.js
// Same dual-secret design — access token + refresh token use SEPARATE keys
@Component
public class JwtUtil {

    @Value("${jwt.access.secret}")
    private String accessSecret;

    @Value("${jwt.refresh.secret}")
    private String refreshSecret;

    @Value("${jwt.access.expiration}")
    private long accessExpiry;   // 1800000ms = 30 min

    @Value("${jwt.refresh.expiration}")
    private long refreshExpiry;  // 604800000ms = 7 days

    // Replaces generateAccessToken(user) from jwt.js
    // Payload includes: id, role, tenant_id, permissions, session_id
    public String generateAccessToken(Long userId, String role,
                                       Long tenantId, List<String> permissions,
                                       String sessionId) {
        return Jwts.builder()
            .subject(userId.toString())
            .claim("role", role)
            .claim("tenant_id", tenantId)
            .claim("permissions", permissions)
            .claim("session_id", sessionId)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + accessExpiry))
            .signWith(getAccessKey())
            .compact();
    }

    // Replaces generateRefreshToken(user) — minimal payload, only id
    public String generateRefreshToken(Long userId) {
        return Jwts.builder()
            .subject(userId.toString())
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + refreshExpiry))
            .signWith(getRefreshKey())
            .compact();
    }

    /**
     * Generate refresh token with custom expiry (for Remember Me support)
     */
    public String generateRefreshToken(Long userId, long customExpiryMs) {
        return Jwts.builder()
            .subject(userId.toString())
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + customExpiryMs))
            .signWith(getRefreshKey())
            .compact();
    }

    // Replaces verifyAccessToken(token) from jwt.js
    public Claims validateAccessToken(String token) {
        return Jwts.parser()
            .verifyWith(getAccessKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    // Replaces verifyRefreshToken(token) from jwt.js
    public Claims validateRefreshToken(String token) {
        return Jwts.parser()
            .verifyWith(getRefreshKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    @PostConstruct
    private void validateConfiguration() {
        Assert.hasText(accessSecret, "JWT access secret must be configured");
        Assert.hasText(refreshSecret, "JWT refresh secret must be configured");
        Assert.isTrue(accessSecret.length() >= 32, "JWT access secret must be at least 32 characters");
        Assert.isTrue(refreshSecret.length() >= 32, "JWT refresh secret must be at least 32 characters");
        Assert.isTrue(accessExpiry > 0, "JWT access expiration must be positive");
        Assert.isTrue(refreshExpiry > 0, "JWT refresh expiration must be positive");
    }

    public long getRefreshExpiryMillis() { return refreshExpiry; }

    public long getAccessExpiryMillis() { return accessExpiry; }

    private SecretKey getAccessKey() {
        return Keys.hmacShaKeyFor(accessSecret.getBytes(StandardCharsets.UTF_8));
    }

    private SecretKey getRefreshKey() {
        return Keys.hmacShaKeyFor(refreshSecret.getBytes(StandardCharsets.UTF_8));
    }
}