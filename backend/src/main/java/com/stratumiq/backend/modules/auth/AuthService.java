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
import com.stratumiq.backend.modules.admin.service.AdminActivityLogger;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.*;

// Replaces: auth.service.js + otp.service.js + otp.utils.js
@Service
public class AuthService {

    private final UserRepository         userRepo;
    private final OtpRepository          otpRepo;
    private final RefreshTokenRepository refreshRepo;
    private final BCryptPasswordEncoder  encoder;
    private final JwtUtil                jwtUtil;
    private final AdminActivityLogger activityLogger;

    public AuthService(UserRepository userRepo,
                       OtpRepository otpRepo,
                       RefreshTokenRepository refreshRepo,
                       BCryptPasswordEncoder encoder,
                       JwtUtil jwtUtil,
                       AdminActivityLogger activityLogger) {
        this.userRepo    = userRepo;
        this.otpRepo     = otpRepo;
        this.refreshRepo = refreshRepo;
        this.encoder     = encoder;
        this.jwtUtil     = jwtUtil;
        this.activityLogger = activityLogger;
    }

    // ── REGISTER ─────────────────────────────────────────────────────────

    @Transactional
    public Map<String, Object> register(RegisterRequest req) {
        if (userRepo.existsByEmail(req.email().toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Email already registered");
        }

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

        String otp = createAndStoreOtp(user.getId(), OtpType.EMAIL);

        // TODO: Replace with real email provider (Resend / SendGrid / AWS SES)
        System.out.println("[AUTH] Email OTP for " + req.email() + ": " + otp);

        return Map.of(
            "message", "Registered. Check your email for the OTP.",
            "userId",  user.getId()
        );
    }

    // ── VERIFY EMAIL OTP ─────────────────────────────────────────────────

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

    @Transactional
    public void sendPhoneOtp(SendPhoneOtpRequest req) {
        String otp = createAndStoreOtp(req.userId(), OtpType.PHONE);

        // TODO: Replace with Twilio / MSG91 / AWS SNS
        System.out.println("[AUTH] Phone OTP for " + req.phone() + ": " + otp);
    }

    // ── VERIFY PHONE OTP ─────────────────────────────────────────────────

    @Transactional
    public Map<String, String> verifyPhoneOtp(VerifyOtpRequest req) {
        verifyOtp(req.userId(), req.otp(), OtpType.PHONE);

        User user = userRepo.findById(req.userId())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "User not found"));

        user.setPhoneVerified(true);
        user.setAccountStatus(AccountStatus.ACTIVE);
        user = userRepo.save(user);

        return issueTokens(user);
    }

    // ── LOGIN ─────────────────────────────────────────────────────────────

    public Map<String, String> login(LoginRequest req) {
        User user = userRepo.findByEmail(req.email().toLowerCase())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (user.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Account not verified. Complete signup first.");
        }

        if (!encoder.matches(req.password(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                "Invalid email or password");
        }

        user.setLastLoginAt(Instant.now());
        userRepo.save(user);

        activityLogger.log(
            user.getTenantId(),
            user.getId(),
            user.getId(),
            "USER_LOGIN",
            "USER",
            user.getId(),
            Map.of(
                "email", user.getEmail(),
                "status","Success"
            )
        );

        return issueTokens(user);
    }

    // ── REFRESH ───────────────────────────────────────────────────────────

    public String refresh(String refreshToken) {
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

        return jwtUtil.generateAccessToken(
            user.getId(),
            user.getRole().name(),
            user.getTenantId(),
            permissionsForRole(user.getRole()),
            UUID.randomUUID().toString()
        );
    }

    // ── LOGOUT ────────────────────────────────────────────────────────────

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            try {
                io.jsonwebtoken.Claims claims =
                jwtUtil.validateRefreshToken(refreshToken);

                Long userId =
        Long.parseLong(claims.getSubject());


                User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"));

                activityLogger.log(
                user.getTenantId(),
                user.getId(),
                user.getId(),
                "USER_LOGOUT",
                "USER",
                user.getId(),
                Map.of(
                        "email", user.getEmail(),
                        "status", "SUCCESS"
                )
        );


                refreshRepo.deleteByToken(refreshToken);
            } catch (Exception e) {
                System.err.println("[AUTH] logout DB warn: " + e.getMessage());
            }
        }
    }

    // ── INTERNAL HELPERS ──────────────────────────────────────────────────

    @Transactional
    public String createAndStoreOtp(Long userId, OtpType type) {
        otpRepo.deleteByUserIdAndType(userId, type);

        String otp = String.format("%06d",
            new SecureRandom().nextInt(1_000_000));

        String otpHash = sha256(otp);

        OtpVerification record = OtpVerification.builder()
            .userId(userId)
            .otpHash(otpHash)
            .type(type)
            .expiresAt(Instant.now().plusMillis(600_000))
            .createdAt(Instant.now())
            .build();

        otpRepo.save(record);
        return otp;
    }

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

        otpRepo.deleteById(record.getId());
    }

    private Map<String, String> issueTokens(User user) {
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());

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
            permissionsForRole(user.getRole()),
            UUID.randomUUID().toString()
        );

        return Map.of(
            "accessToken",  accessToken,
            "refreshToken", refreshToken
        );
    }

    /**
     * Returns the permission strings baked into the JWT for each role.
     * These must match the PERM_ authorities checked in @PreAuthorize
     * annotations (without the "PERM_" prefix — JwtAuthFilter adds that).
     *
     * TODO: Replace with DB-driven RBAC once that phase is built.
     */
    private List<String> permissionsForRole(Role role) {
        return switch (role) {
            case SUPER_ADMIN -> List.of(
                "fleet:view",        "fleet:create",
                "fleet:edit",        "fleet:delete",
                "maintenance:view",  "maintenance:create",
                "maintenance:edit",
                "admin:dashboard:view",
                "admin:users:view",  "admin:users:edit",
                "admin:fleet:view",
                "admin:support:view", "admin:support:manage"
            );
            case ADMIN -> List.of(
                "fleet:view",        "fleet:create",
                "fleet:edit",        "fleet:delete",
                "maintenance:view",  "maintenance:create",
                "maintenance:edit",
                "admin:dashboard:view",
                "admin:users:view",  "admin:users:edit",
                "admin:fleet:view",
                "admin:support:view", "admin:support:manage"
            );
            case DEALER -> List.of(
                "fleet:view",
                "maintenance:view"
            );
            case USER -> List.of(
                "fleet:view",
    "fleet:create",
    "fleet:edit",
    "fleet:delete",
    "maintenance:view",
    "maintenance:create",
    "maintenance:edit"
            );
        };
    }

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