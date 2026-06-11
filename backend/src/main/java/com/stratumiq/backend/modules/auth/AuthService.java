package com.stratumiq.backend.modules.auth;

import com.stratumiq.backend.common.enums.AccountStatus;
import com.stratumiq.backend.common.enums.OtpType;
import com.stratumiq.backend.common.enums.Role;
import com.stratumiq.backend.entity.*;
import com.stratumiq.backend.modules.auth.dto.*;
import com.stratumiq.backend.repository.*;
import com.stratumiq.backend.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.*;

// Replaces: auth.service.js + otp.service.js + otp.utils.js
@Service
public class AuthService {

    private final UserRepository       userRepo;
    private final OtpRepository        otpRepo;
    private final RefreshTokenRepository refreshRepo;
    private final BCryptPasswordEncoder  encoder;
    private final JwtUtil                jwtUtil;

    public AuthService(UserRepository userRepo,
                       OtpRepository otpRepo,
                       RefreshTokenRepository refreshRepo,
                       BCryptPasswordEncoder encoder,
                       JwtUtil jwtUtil) {
        this.userRepo    = userRepo;
        this.otpRepo     = otpRepo;
        this.refreshRepo = refreshRepo;
        this.encoder     = encoder;
        this.jwtUtil     = jwtUtil;
    }

    // ── REGISTER ─────────────────────────────────────────────────────────
    // Replaces createUser() + storeOTP() + generateOTP() in auth.controller.js

    @Transactional
    public Map<String, Object> register(RegisterRequest req) {
        // Replaces: findUserByEmail check → 409
        if (userRepo.existsByEmail(req.email().toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Email already registered");
        }

        // Replaces: hashPassword(value.password) from hash.js via bcrypt
        User user = User.builder()
            .firstName(req.firstName())
            .lastName(req.lastName())
            .email(req.email().toLowerCase())
            .password(encoder.encode(req.password()))
            .phone(req.phone())
            .role(Role.USER)
            .accountStatus(AccountStatus.PENDING)
            .emailVerified(false)
            .phoneVerified(false)
            .createdAt(Instant.now())
            .build();

        user = userRepo.save(user);

        // Replaces: generateOTP() + hashOTP() + storeOTP() from otp.utils/service.js
        String otp = createAndStoreOtp(user.getId(), OtpType.EMAIL);

        // TODO: Replace with real email provider (Resend / SendGrid / AWS SES)
        System.out.println("[AUTH] Email OTP for " + req.email() + ": " + otp);

        return Map.of(
            "message", "Registered. Check your email for the OTP.",
            "userId",  user.getId()
        );
    }

    // ── VERIFY EMAIL OTP ─────────────────────────────────────────────────
    // Replaces verifyEmailOTP() in auth.controller.js

    @Transactional
    public Map<String, Object> verifyEmailOtp(VerifyOtpRequest req) {
        verifyOtp(req.userId(), req.otp(), OtpType.EMAIL);

        User user = userRepo.findById(req.userId())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "User not found"));

        user.setEmailVerified(true);
        userRepo.save(user);

        return Map.of(
            "message",  "Email verified successfully.",
            "userId",   user.getId(),
            "nextStep", "verify-phone"
        );
    }

    // ── SEND PHONE OTP ───────────────────────────────────────────────────
    // Replaces sendPhoneOTP() in auth.controller.js

    @Transactional
    public void sendPhoneOtp(SendPhoneOtpRequest req) {
        String otp = createAndStoreOtp(req.userId(), OtpType.PHONE);

        // TODO: Replace with Twilio / MSG91 / AWS SNS
        System.out.println("[AUTH] Phone OTP for " + req.phone() + ": " + otp);
    }

    // ── VERIFY PHONE OTP ─────────────────────────────────────────────────
    // Replaces verifyPhoneOTP() in auth.controller.js
    // Also activates account + issues tokens (same flow as Node.js)

    @Transactional
    public Map<String, String> verifyPhoneOtp(VerifyOtpRequest req) {
        verifyOtp(req.userId(), req.otp(), OtpType.PHONE);

        User user = userRepo.findById(req.userId())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "User not found"));

        // Replaces activateUser() in auth.service.js
        user.setPhoneVerified(true);
        user.setAccountStatus(AccountStatus.ACTIVE);
        user = userRepo.save(user);

        return issueTokens(user);
    }

    // ── LOGIN ─────────────────────────────────────────────────────────────
    // Replaces login() in auth.controller.js — same error message for
    // email-not-found AND wrong-password to avoid user enumeration

    public Map<String, String> login(LoginRequest req) {
        User user = userRepo.findByEmail(req.email().toLowerCase())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (user.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Account not verified. Complete signup first.");
        }

        // Replaces comparePassword() from hash.js
        if (!encoder.matches(req.password(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                "Invalid email or password");
        }

        return issueTokens(user);
    }

    // ── REFRESH ───────────────────────────────────────────────────────────
    // Replaces refresh() in auth.controller.js

    public String refresh(String refreshToken) {
        // Check token exists in DB — replaces findRefreshToken()
        refreshRepo.findByToken(refreshToken)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.FORBIDDEN, "Invalid refresh token"));

        io.jsonwebtoken.Claims claims;
        try {
            claims = jwtUtil.validateRefreshToken(refreshToken);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Refresh token expired or invalid");
        }

        Long userId = Long.parseLong(claims.getSubject());
        User user = userRepo.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.FORBIDDEN, "User not found"));

        if (user.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "User inactive");
        }

        // Issue new access token only — refresh token stays valid
        return jwtUtil.generateAccessToken(
            user.getId(),
            user.getRole().name(),
            user.getTenantId(),
            List.of(),
            UUID.randomUUID().toString()
        );
    }

    // ── LOGOUT ────────────────────────────────────────────────────────────
    // Replaces logout() in auth.controller.js

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            try {
                refreshRepo.deleteByToken(refreshToken);
            } catch (Exception e) {
                // Non-blocking — logout succeeds even if DB delete fails
                System.err.println("[AUTH] logout DB warn: " + e.getMessage());
            }
        }
    }

    // ── INTERNAL HELPERS ──────────────────────────────────────────────────

    // Replaces generateOTP() + hashOTP() + storeOTP()
    // from otp.utils.js + otp.service.js
    @Transactional
    public String createAndStoreOtp(Long userId, OtpType type) {
        // Delete previous OTPs for this user+type — same as storeOTP() cleanup
        otpRepo.deleteByUserIdAndType(userId, type);

        // Cryptographically secure — replaces crypto.randomInt(0, 1_000_000)
        String otp = String.format("%06d",
            new SecureRandom().nextInt(1_000_000));

        // SHA-256 — replaces crypto.createHash('sha256') from otp.utils.js
        String otpHash = sha256(otp);

        OtpVerification record = OtpVerification.builder()
            .userId(userId)
            .otpHash(otpHash)
            .type(type)
            .expiresAt(Instant.now().plusMillis(600_000)) // 10 min TTL
            .createdAt(Instant.now())
            .build();

        otpRepo.save(record);
        return otp; // return plaintext for sending via email/SMS
    }

    // Replaces isOTPExpired() + hashOTP() comparison in auth.controller.js
    private void verifyOtp(Long userId, String otp, OtpType type) {
        OtpVerification record = otpRepo
            .findTopByUserIdAndTypeOrderByCreatedAtDesc(userId, type)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "OTP not found. Please request a new one."));

        if (record.getExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "OTP has expired. Please request a new one.");
        }

        if (!record.getOtpHash().equals(sha256(otp))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Invalid OTP.");
        }

        // Consume OTP — replaces deleteOTP() in otp.service.js
        otpRepo.deleteById(record.getId());
    }

    // Replaces generateAccessToken + generateRefreshToken + saveRefreshToken
    private Map<String, String> issueTokens(User user) {
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());

        // Replaces saveRefreshToken() in auth.service.js
        RefreshToken rt = RefreshToken.builder()
            .userId(user.getId())
            .token(refreshToken)
            .createdAt(Instant.now())
            .build();
        refreshRepo.save(rt);

        String accessToken = jwtUtil.generateAccessToken(
            user.getId(),
            user.getRole().name(),
            user.getTenantId(),
            List.of(),                       // permissions — populated after RBAC phase
            UUID.randomUUID().toString()     // session_id
        );

        return Map.of(
            "accessToken",  accessToken,
            "refreshToken", refreshToken
        );
    }

    // Replaces hashOTP() from otp.utils.js
    private String sha256(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(input.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 not available", e);
        }
    }
}