package com.stratumiq.backend.modules.auth;

import com.stratumiq.backend.modules.auth.dto.*;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// Replaces auth.controller.js + auth.routes.js
// All 7 endpoints — same paths, same response shapes
@RestController
@RequestMapping("/api/auth")
public class AuthController {

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
        var tokens = authService.login(req);
        setRefreshCookie(response, tokens.get("refreshToken"));
        return ResponseEntity.ok(Map.of(
            "message",     "Login successful.",
            "accessToken", tokens.get("accessToken")
        ));
    }

    // GET /api/auth/refresh — reads httpOnly cookie
    @GetMapping("/refresh")
    public ResponseEntity<?> refresh(
            @CookieValue(name = "refreshToken", required = false) String token) {
        if (token == null) {
            return ResponseEntity.status(401)
                .body(Map.of("error", "No refresh token"));
        }
        return ResponseEntity.ok(Map.of(
            "accessToken", authService.refresh(token)
        ));
    }

    // POST /api/auth/logout
    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @CookieValue(name = "refreshToken", required = false) String token,
            HttpServletResponse response) {
        authService.logout(token);
        clearRefreshCookie(response);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully."));
    }

    // ── Cookie helpers ────────────────────────────────────────────────────
    // Replaces REFRESH_COOKIE_OPTIONS from auth.controller.js

    private void setRefreshCookie(HttpServletResponse res, String token) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", token)
            .httpOnly(true)
            .secure(false)        // set true in production
            .sameSite("Lax")      // Lax in dev — same as your Node.js config
            .maxAge(7 * 24 * 60 * 60)
            .path("/")
            .build();
        res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshCookie(HttpServletResponse res) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
            .httpOnly(true)
            .secure(false)
            .sameSite("Lax")
            .maxAge(0)            // maxAge 0 = delete cookie
            .path("/")
            .build();
        res.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}