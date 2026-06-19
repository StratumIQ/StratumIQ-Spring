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
import java.util.Objects;

// Replaces: auth.service.js + otp.service.js + otp.utils.js
@Service
public class AuthService {

    private final UserRepository         userRepo;
    private final OtpRepository          otpRepo;
    private final RefreshTokenRepository refreshRepo;
    private final BCryptPasswordEncoder  encoder;
    private final JwtUtil                jwtUtil;
    private final com.stratumiq.backend.security.JwtSecurityEnhancements jwtEnhancements;
    private final AdminActivityLogger activityLogger;
    private final org.springframework.data.redis.core.RedisTemplate<String, Object> redis;

    public AuthService(UserRepository userRepo,
                       OtpRepository otpRepo,
                       RefreshTokenRepository refreshRepo,
                       BCryptPasswordEncoder encoder,
                       JwtUtil jwtUtil,
                       AdminActivityLogger activityLogger,
                       com.stratumiq.backend.security.JwtSecurityEnhancements jwtEnhancements,
                       org.springframework.data.redis.core.RedisTemplate<String, Object> redis) {
        this.userRepo    = userRepo;
        this.otpRepo     = otpRepo;
        this.refreshRepo = refreshRepo;
        this.encoder     = encoder;
        this.jwtUtil     = jwtUtil;
        this.activityLogger = activityLogger;
        this.jwtEnhancements = jwtEnhancements;
        this.redis = redis;
    }

    // ── REGISTER ─────────────────────────────────────────────────────────

    @Transactional
    @SuppressWarnings("null")
    public Map<String, Object> register(RegisterRequest req) {
        if (userRepo.existsByEmail(req.email().toLowerCase())) {
            activityLogger.log(null, null, null, "USER_REGISTRATION_FAILED", "USER", null,
                Map.of("email", req.email().toLowerCase(), "reason", "Email already registered"));
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

        User savedUser = userRepo.save(user);
        user = savedUser;

        String otp = createAndStoreOtp(user.getId(), OtpType.EMAIL);

        // Log successful registration
        activityLogger.log(user.getTenantId(), user.getId(), user.getId(), "USER_REGISTERED", "USER", user.getId(),
            Map.of("email", user.getEmail(), "firstName", user.getFirstName(), "lastName", user.getLastName()));

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
        Long userId = Objects.requireNonNull(req.userId(), "userId");
        try {
            verifyOtp(userId, req.otp(), OtpType.EMAIL);
        } catch (ResponseStatusException e) {
            User user = userRepo.findById(userId).orElse(null);
            activityLogger.log(user != null ? user.getTenantId() : null, userId, userId,
                "OTP_VERIFICATION_FAILED", "USER", userId,
                Map.of("otpType", "EMAIL", "reason", e.getReason()));
            throw e;
        }

        User user = userRepo.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "User not found"));

        user.setEmailVerified(true);
        user = Optional.ofNullable(userRepo.save(user))
            .orElseThrow(() -> new IllegalStateException("Failed to update verified user"));

        activityLogger.log(user.getTenantId(), user.getId(), user.getId(), "EMAIL_VERIFIED", "USER", user.getId(),
            Map.of("email", user.getEmail()));

        return Map.of(
            "message",  "Email verified successfully.",
            "userId",   user.getId(),
            "nextStep", "verify-phone"
        );
    }

    // ── SEND PHONE OTP ───────────────────────────────────────────────────

    @Transactional
    public void sendPhoneOtp(SendPhoneOtpRequest req) {
        Long userId = Objects.requireNonNull(req.userId(), "userId");
        User user = userRepo.findById(userId).orElse(null);
        String otp = createAndStoreOtp(userId, OtpType.PHONE);

        activityLogger.log(user != null ? user.getTenantId() : null, userId, userId,
            "PHONE_OTP_SENT", "USER", userId, Map.of("phone", req.phone()));

        // TODO: Replace with Twilio / MSG91 / AWS SNS
        System.out.println("[AUTH] Phone OTP for " + req.phone() + ": " + otp);
    }

    // ── VERIFY PHONE OTP ─────────────────────────────────────────────────

    @Transactional
    @SuppressWarnings("null")
    public Map<String, String> verifyPhoneOtp(VerifyOtpRequest req) {
        Long userId = Objects.requireNonNull(req.userId(), "userId");
        try {
            verifyOtp(userId, req.otp(), OtpType.PHONE);
        } catch (ResponseStatusException e) {
            User user = userRepo.findById(userId).orElse(null);
            activityLogger.log(user != null ? user.getTenantId() : null, userId, userId,
                "OTP_VERIFICATION_FAILED", "USER", userId,
                Map.of("otpType", "PHONE", "reason", e.getReason()));
            throw e;
        }

        User user = userRepo.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "User not found"));

        user.setPhoneVerified(true);
        user.setAccountStatus(AccountStatus.ACTIVE);
        User verifiedUser = userRepo.save(user);
        user = verifiedUser;

        activityLogger.log(user.getTenantId(), user.getId(), user.getId(), "PHONE_VERIFIED", "USER", user.getId(),
            Map.of("phone", user.getPhone(), "accountStatus", "ACTIVE"));

        return issueTokens(user);
    }

    // ── LOGIN ─────────────────────────────────────────────────────────────

    @SuppressWarnings("null")
    public Map<String, String> login(LoginRequest req) {
        String email = req.email().toLowerCase();

        // Check account/IP lockouts
        String lockKey = "lock:login:email:" + email;
        if (Boolean.TRUE.equals(redis.hasKey(lockKey))) {
            throw new ResponseStatusException(HttpStatus.LOCKED, "Account temporarily locked due to repeated failed logins");
        }

        User user = userRepo.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (user.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Account not verified. Complete signup first.");
        }

        if (!encoder.matches(req.password(), user.getPassword())) {
            // increment failure counter
            String failKey = "fail:login:email:" + email;
            Long fails = redis.opsForValue().increment(failKey, 1);
            java.time.Duration lockDuration = Objects.requireNonNull(java.time.Duration.ofMinutes(30));
            if (fails != null && fails == 1L) redis.expire(failKey, lockDuration);
            if (fails != null && fails >= 5) {
                // lock account for 30 minutes
                redis.opsForValue().set(lockKey, "1", lockDuration);
                activityLogger.log(
                    user.getTenantId(),
                    user.getId(),
                    user.getId(),
                    "USER_LOCKOUT",
                    "USER",
                    user.getId(),
                    Map.of("email", user.getEmail(), "reason", "Too many failed logins")
                );
                throw new ResponseStatusException(HttpStatus.LOCKED, "Account temporarily locked due to repeated failed logins");
            }

            activityLogger.log(
                user.getTenantId(),
                user.getId(),
                user.getId(),
                "USER_LOGIN",
                "USER",
                user.getId(),
                Map.of("email", user.getEmail(), "status", "Failed")
            );

            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                "Invalid email or password");
        }

        // Successful login — reset failure counter
        try { redis.delete("fail:login:email:" + email); } catch (Exception ignore) {}

        user.setLastLoginAt(Instant.now());
        user = Optional.ofNullable(userRepo.save(user))
            .orElseThrow(() -> new IllegalStateException("Failed to update login timestamp"));

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

    @SuppressWarnings("null")
    public Map<String, String> refresh(String refreshToken) {
        // Validate token signature and expiry
        io.jsonwebtoken.Claims claims;
        try {
            claims = jwtUtil.validateRefreshToken(refreshToken);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Refresh token expired or invalid");
        }

        // Ensure token exists in persistent store (DB or Redis)
        Long userId = Long.parseLong(claims.getSubject());

        // Fetch user early (needed for all audit logs)
        User user = userRepo.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.FORBIDDEN, "User not found"));

        // Detect token reuse: if token is known to be revoked (used after rotation)
        if (jwtEnhancements.isRefreshTokenRevoked(refreshToken)) {
            // token reuse detected — revoke all user's refresh tokens and alert
            // revoke DB tokens for user
            try {
                refreshRepo.deleteByUserId(userId);
            } catch (Exception ignore) {}
            // blacklist access tokens (best-effort)
            jwtEnhancements.revokeRefreshToken(refreshToken);
            activityLogger.log(user.getTenantId(), user.getId(), user.getId(), "REFRESH_TOKEN_REUSE", "SECURITY", user.getId(), Map.of("token", "reused"));
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Refresh token reuse detected");
        }

        if (!refreshRepo.findByToken(refreshToken).isPresent() && !jwtEnhancements.isRefreshTokenPresent(refreshToken)) {
            activityLogger.log(user.getTenantId(), user.getId(), user.getId(), "INVALID_REFRESH_TOKEN", "SECURITY", user.getId(),
                Map.of("email", user.getEmail(), "reason", "Token not found in store"));
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid refresh token");
        }

        if (user.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "User inactive");
        }

        // Rotate refresh token: revoke old, issue new and persist
        try {
            // revoke DB record if present
            refreshRepo.deleteByToken(refreshToken);
        } catch (Exception e) {
            // ignore
        }
        jwtEnhancements.revokeRefreshToken(refreshToken, java.time.Duration.ofMillis(jwtUtil.getRefreshExpiryMillis()));

        String newRefresh = jwtUtil.generateRefreshToken(user.getId());
        RefreshToken rt = RefreshToken.builder()
            .userId(user.getId())
            .token(newRefresh)
            .createdAt(java.time.Instant.now())
            .build();
        refreshRepo.save(rt);
        // also store in Redis with same TTL as configured refresh expiry
        jwtEnhancements.storeRefreshToken(newRefresh, user.getId(), java.time.Duration.ofMillis(jwtUtil.getRefreshExpiryMillis()));

        // Log successful token refresh and rotation
        activityLogger.log(user.getTenantId(), user.getId(), user.getId(), "REFRESH_TOKEN_ROTATED", "SECURITY", user.getId(),
            Map.of("email", user.getEmail(), "oldTokenRevoked", true, "newTokenIssued", true));

        String accessToken = jwtUtil.generateAccessToken(
            user.getId(),
            user.getRole().name(),
            user.getTenantId(),
            permissionsForRole(user.getRole()),
            UUID.randomUUID().toString()
        );

        return Map.of(
            "accessToken", accessToken,
            "refreshToken", newRefresh
        );
    }

    // ── LOGOUT ────────────────────────────────────────────────────────────

    @Transactional
    public void logout(String refreshToken, String accessToken, String authorizationHeader) {
        if (accessToken != null && !accessToken.isBlank()) {
            try {
                io.jsonwebtoken.Claims accessClaims = jwtUtil.validateAccessToken(accessToken);
                long remainingSeconds = Math.max(0,
                    (accessClaims.getExpiration().getTime() - System.currentTimeMillis()) / 1000);
                if (remainingSeconds > 0) {
                    jwtEnhancements.blacklistAccessToken(accessToken, remainingSeconds);
                }
            } catch (Exception ignore) {
                // ignore invalid or expired access token during logout
            }
        } else if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String headerToken = authorizationHeader.substring(7);
            try {
                io.jsonwebtoken.Claims accessClaims = jwtUtil.validateAccessToken(headerToken);
                long remainingSeconds = Math.max(0,
                    (accessClaims.getExpiration().getTime() - System.currentTimeMillis()) / 1000);
                if (remainingSeconds > 0) {
                    jwtEnhancements.blacklistAccessToken(headerToken, remainingSeconds);
                }
            } catch (Exception ignore) {
                // ignore invalid or expired access token during logout
            }
        }

        if (refreshToken != null && !refreshToken.isBlank()) {
            try {
                io.jsonwebtoken.Claims claims = jwtUtil.validateRefreshToken(refreshToken);
                Long userId = Long.parseLong(claims.getSubject());

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
                try {
                    jwtEnhancements.revokeRefreshToken(refreshToken, java.time.Duration.ofMillis(jwtUtil.getRefreshExpiryMillis()));
                } catch (Exception ignore) {}
            } catch (Exception e) {
                System.err.println("[AUTH] logout DB warn: " + e.getMessage());
            }
        }
    }

    // ── INTERNAL HELPERS ──────────────────────────────────────────────────

    @Transactional
    @SuppressWarnings("null")
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

        Long recordId = Objects.requireNonNull(record.getId(), "OTP record ID is missing");
        otpRepo.deleteById(recordId);
    }

    @SuppressWarnings("null")
    private Map<String, String> issueTokens(User user) {
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());

        RefreshToken rt = RefreshToken.builder()
            .userId(user.getId())
            .token(refreshToken)
            .createdAt(Instant.now())
            .build();
        refreshRepo.save(rt);

        // Store refresh token in Redis for quick revocation and rotation checks
        jwtEnhancements.storeRefreshToken(refreshToken, user.getId(), java.time.Duration.ofMillis(jwtUtil.getRefreshExpiryMillis()));

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