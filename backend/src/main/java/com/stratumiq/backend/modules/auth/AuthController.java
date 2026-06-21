package com.stratumiq.backend.modules.auth;

import com.stratumiq.backend.modules.auth.dto.*;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.Duration;

import java.util.Map;

// Replaces auth.controller.js + auth.routes.js
// All 7 endpoints — same paths, same response shapes
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${app.cookie.same-site:Lax}")
    private String cookieSameSite;

    @Value("${jwt.access.expiration:900000}")
    private long accessExpiryMillis;

    @Value("${jwt.refresh.expiration:604800000}")
    private long refreshExpiryMillis;

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        logger.info("Register request for email: {}", req.email());
        return ResponseEntity.status(201).body(authService.register(req));
    }

    // POST /api/auth/verify-email-otp
    @PostMapping("/verify-email-otp")
    public ResponseEntity<?> verifyEmailOtp(
            @Valid @RequestBody VerifyOtpRequest req) {
        logger.info("Verify email OTP for user: {}", req.userId());
        return ResponseEntity.ok(authService.verifyEmailOtp(req));
    }

    // POST /api/auth/send-phone-otp
    @PostMapping("/send-phone-otp")
    public ResponseEntity<?> sendPhoneOtp(
            @Valid @RequestBody SendPhoneOtpRequest req) {
        logger.info("Send phone OTP for user: {}", req.userId());
        authService.sendPhoneOtp(req);
        return ResponseEntity.ok(Map.of("message", "Phone OTP sent."));
    }

    // POST /api/auth/verify-phone-otp
    @PostMapping("/verify-phone-otp")
    public ResponseEntity<?> verifyPhoneOtp(
            @Valid @RequestBody VerifyOtpRequest req,
            HttpServletResponse response) {
        logger.info("Verify phone OTP for user: {}", req.userId());
        var tokens = authService.verifyPhoneOtp(req);
        setRefreshCookie(response, tokens.get("refreshToken"));
        setAccessCookie(response, tokens.get("accessToken"));
        return ResponseEntity.ok(Map.of(
            "message",     "Account activated. Welcome to StratumIQ.",
            "accessToken", tokens.get("accessToken"),
            "refreshToken", tokens.get("refreshToken")
        ));
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest req,
            HttpServletResponse response) {

        try {
            logger.info("Processing login request for: {}", req.email());
            var tokens = authService.login(req);

            setRefreshCookie(response, tokens.get("refreshToken"));
            setAccessCookie(response, tokens.get("accessToken"));

            return ResponseEntity.ok(Map.of(
                "message", "Login successful.",
                "accessToken", tokens.get("accessToken"),
                "refreshToken", tokens.get("refreshToken")
            ));

        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    // GET /api/auth/refresh — reads httpOnly cookie (same-origin clients)
    @GetMapping("/refresh")
    public ResponseEntity<?> refresh(
            @CookieValue(name = "refreshToken", required = false) String token,
            HttpServletResponse response) {
        return refreshWithToken(token, response);
    }

    // POST /api/auth/refresh — body token for cross-origin clients (Vercel → Railway)
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshPost(
            @RequestBody(required = false) RefreshTokenRequest body,
            @CookieValue(name = "refreshToken", required = false) String cookieToken,
            HttpServletResponse response) {
        String token = resolveRefreshToken(body, cookieToken);
        return refreshWithToken(token, response);
    }

    private ResponseEntity<?> refreshWithToken(String token, HttpServletResponse response) {
        if (token == null || token.isBlank()) {
            clearRefreshCookie(response);
            return ResponseEntity.status(401)
                .body(Map.of("error", "No refresh token"));
        }

        try {
            var tokens = authService.refresh(token);
            setRefreshCookie(response, tokens.get("refreshToken"));
            setAccessCookie(response, tokens.get("accessToken"));
            return ResponseEntity.ok(Map.of(
                "accessToken", tokens.get("accessToken"),
                "refreshToken", tokens.get("refreshToken")
            ));
        } catch (ResponseStatusException e) {
            clearRefreshCookie(response);
            clearAccessCookie(response);
            return ResponseEntity.status(e.getStatusCode())
                .body(Map.of("error", e.getReason()));
        }
    }

    private String resolveRefreshToken(RefreshTokenRequest body, String cookieToken) {
        if (body != null && body.refreshToken() != null && !body.refreshToken().isBlank()) {
            return body.refreshToken();
        }
        return cookieToken;
    }

    // POST /api/auth/logout
    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @CookieValue(name = "refreshToken", required = false) String cookieRefresh,
            @RequestBody(required = false) RefreshTokenRequest body,
            @CookieValue(name = "accessToken", required = false) String accessToken,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            HttpServletResponse response) {
        String refreshToken = resolveRefreshToken(body, cookieRefresh);
        authService.logout(refreshToken, accessToken, authorizationHeader);
        clearRefreshCookie(response);
        clearAccessCookie(response);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully."));
    }

    // ── Cookie helpers ────────────────────────────────────────────────────
    // Replaces REFRESH_COOKIE_OPTIONS from auth.controller.js

    private void setRefreshCookie(HttpServletResponse res, String token) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", token)
            .httpOnly(true)
            .secure(cookieSecure)
            .sameSite(cookieSameSite)
            .maxAge(Duration.ofMillis(refreshExpiryMillis).getSeconds())
            .path("/")
            .build();
        res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshCookie(HttpServletResponse res) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
            .httpOnly(true)
            .secure(cookieSecure)
            .sameSite(cookieSameSite)
            .maxAge(0)            // maxAge 0 = delete cookie
            .path("/")
            .build();
        res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void setAccessCookie(HttpServletResponse res, String token) {
        ResponseCookie cookie = ResponseCookie.from("accessToken", token)
            .httpOnly(true)
            .secure(cookieSecure)
            .sameSite(cookieSameSite)
            .maxAge(Duration.ofMillis(accessExpiryMillis).getSeconds())
            .path("/")
            .build();
        res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearAccessCookie(HttpServletResponse res) {
        ResponseCookie cookie = ResponseCookie.from("accessToken", "")
            .httpOnly(true)
            .secure(cookieSecure)
            .sameSite(cookieSameSite)
            .maxAge(0)
            .path("/")
            .build();
        res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}