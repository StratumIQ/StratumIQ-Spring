package com.stratumiq.backend.modules.auth;

import com.stratumiq.backend.modules.auth.dto.*;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.Duration;

import java.util.Map;

// Replaces auth.controller.js + auth.routes.js
// All 7 endpoints — same paths, same response shapes
@RestController
@RequestMapping("/api/auth")
public class AuthController {

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
        return ResponseEntity.status(201).body(authService.register(req));
    }

    // POST /api/auth/verify-email-otp
    @PostMapping("/verify-email-otp")
    public ResponseEntity<?> verifyEmailOtp(
            @Valid @RequestBody VerifyOtpRequest req) {
        return ResponseEntity.ok(authService.verifyEmailOtp(req));
    }

    // POST /api/auth/send-phone-otp
    @PostMapping("/send-phone-otp")
    public ResponseEntity<?> sendPhoneOtp(
            @Valid @RequestBody SendPhoneOtpRequest req) {
        authService.sendPhoneOtp(req);
        return ResponseEntity.ok(Map.of("message", "Phone OTP sent."));
    }

    // POST /api/auth/verify-phone-otp
    @PostMapping("/verify-phone-otp")
    public ResponseEntity<?> verifyPhoneOtp(
            @Valid @RequestBody VerifyOtpRequest req,
            HttpServletResponse response) {
        var tokens = authService.verifyPhoneOtp(req);
        setRefreshCookie(response, tokens.get("refreshToken"));
        setAccessCookie(response, tokens.get("accessToken"));
        return ResponseEntity.ok(Map.of(
            "message",     "Account activated. Welcome to StratumIQ.",
            "accessToken", tokens.get("accessToken")
        ));
    }

    // POST /api/auth/login
   @PostMapping("/login")
public ResponseEntity<?> login(
        @Valid @RequestBody LoginRequest req,
        HttpServletResponse response) {

    try {
        System.out.println("LOGIN START: " + req.email());

        var tokens = authService.login(req);

        System.out.println("LOGIN SUCCESS");

        setRefreshCookie(response, tokens.get("refreshToken"));
        setAccessCookie(response, tokens.get("accessToken"));

        return ResponseEntity.ok(Map.of(
            "message", "Login successful.",
            "accessToken", tokens.get("accessToken")
        ));

    } catch (Exception e) {
        e.printStackTrace();
        throw e;
    }
}
    // GET /api/auth/refresh — reads httpOnly cookie
    @GetMapping("/refresh")
    public ResponseEntity<?> refresh(
            @CookieValue(name = "refreshToken", required = false) String token,
            HttpServletResponse response) {
        if (token == null) {
            clearRefreshCookie(response);
            return ResponseEntity.status(401)
                .body(Map.of("error", "No refresh token"));
        }

        try {
            var tokens = authService.refresh(token);
            setRefreshCookie(response, tokens.get("refreshToken"));
            setAccessCookie(response, tokens.get("accessToken"));
            return ResponseEntity.ok(Map.of(
                "accessToken", tokens.get("accessToken")
            ));
        } catch (ResponseStatusException e) {
            clearRefreshCookie(response);
            clearAccessCookie(response);
            return ResponseEntity.status(e.getStatusCode())
                .body(Map.of("error", e.getReason()));
        }
    }

    // POST /api/auth/logout
    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @CookieValue(name = "refreshToken", required = false) String token,
            @CookieValue(name = "accessToken", required = false) String accessToken,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            HttpServletResponse response) {
        authService.logout(token, accessToken, authorizationHeader);
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