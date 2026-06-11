package com.stratumiq.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
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
    private long accessExpiry;   // 900000ms = 15 min

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

    private SecretKey getAccessKey() {
        return Keys.hmacShaKeyFor(accessSecret.getBytes());
    }

    private SecretKey getRefreshKey() {
        return Keys.hmacShaKeyFor(refreshSecret.getBytes());
    }
}