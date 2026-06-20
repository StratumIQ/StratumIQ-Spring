package com.stratumiq.backend.modules.auth;

import com.stratumiq.backend.common.enums.AccountStatus;
import com.stratumiq.backend.common.enums.OtpType;
import com.stratumiq.backend.common.enums.Role;
import com.stratumiq.backend.entity.*;
import com.stratumiq.backend.modules.auth.dto.*;
import com.stratumiq.backend.repository.*;
import com.stratumiq.backend.security.JwtUtil;
import com.stratumiq.backend.security.TokenStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.stratumiq.backend.modules.admin.service.AdminActivityLogger;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.*;
import java.util.Objects;

// Replaces: auth.service.js + otp.service.js + otp.utils.js
@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository         userRepo;
    private final OtpRepository          otpRepo;
    private final RefreshTokenRepository refreshRepo;
    private final BCryptPasswordEncoder  encoder;
    private final JwtUtil                jwtUtil;
    private final com.stratumiq.backend.security.JwtSecurityEnhancements jwtEnhancements;
    private final AdminActivityLogger activityLogger;
    private final TokenStorageService tokenStorage;

    public AuthService(UserRepository userRepo,
                       OtpRepository otpRepo,
                       RefreshTokenRepository refreshRepo,
                       BCryptPasswordEncoder encoder,
                       JwtUtil jwtUtil,
                       AdminActivityLogger activityLogger,
                       com.stratumiq.backend.security.JwtSecurityEnhancements jwtEnhancements,
                       TokenStorageService tokenStorage) {
        this.userRepo    = userRepo;
        this.otpRepo     = otpRepo;
        this.refreshRepo = refreshRepo;
        this.encoder     = encoder;
        this.jwtUtil     = jwtUtil;
        this.activityLogger = activityLogger;
        this.jwtEnhancements = jwtEnhancements;
        this.tokenStorage = tokenStorage;
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
        logger.info("Login attempt for email: {}", email);

        // Check if account is locked due to brute-force attempts
        if (tokenStorage.isAccountLocked(email)) {
            logger.warn("Login attempt on locked account: {}", email);
            throw new ResponseStatusException(HttpStatus.LOCKED, 
                "Account temporarily locked due to repeated failed logins");
        }

        // Fetch user
        User user = userRepo.findByEmail(email)
            .orElseThrow(() -> {
                logger.warn("Login attempt for non-existent email: {}", email);
                return new ResponseStatusException(HttpStatus.UNAUTHORIZED, 
                    "Invalid email or password");
            });

        // Check account status
        if (user.getAccountStatus() != AccountStatus.ACTIVE) {
            logger.warn("Login attempt for inactive account: {} (status: {})", email, user.getAccountStatus());
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Account not verified. Complete signup first.");
        }

        // Verify password
        if (!encoder.matches(req.password(), user.getPassword())) {
            logger.warn("Failed login attempt for {}", email);
            
            // Record failed attempt and check if we should lock the account
            tokenStorage.recordFailedLogin(email);
            int failedCount = tokenStorage.getFailedLoginCount(email);
            
            if (failedCount >= 5) {
                // Lock account for 30 minutes
                tokenStorage.lockAccount(email, 1800);  // 30 minutes
                logger.warn("Account locked after 5 failed attempts: {}", email);
                
                activityLogger.log(
                    user.getTenantId(),
                    user.getId(),
                    user.getId(),
                    "USER_LOCKOUT",
                    "USER",
                    user.getId(),
                    Map.of("email", user.getEmail(), "reason", "Too many failed logins")
                );
                
                throw new ResponseStatusException(HttpStatus.LOCKED, 
                    "Account temporarily locked due to repeated failed logins");
            }

            activityLogger.log(
                user.getTenantId(),
                user.getId(),
                user.getId(),
                "USER_LOGIN_FAILED",
                "USER",
                user.getId(),
                Map.of("email", user.getEmail(), "attempt", failedCount)
            );

            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                "Invalid email or password");
        }

        // Successful login — reset failure counter and update login timestamp
        tokenStorage.clearFailedLoginCount(email);
        logger.info("Successful login for: {}", email);
        
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
            Map.of("email", user.getEmail(), "status", "Success")
        );

        return issueTokens(user);
    }

    // ── REFRESH ───────────────────────────────────────────────────────────

    @SuppressWarnings("null")
    public Map<String, String> refresh(String refreshToken) {
        logger.info("Refresh token request");
        
        // Validate token signature and expiry
        io.jsonwebtoken.Claims claims;
        try {
            claims = jwtUtil.validateRefreshToken(refreshToken);
        } catch (Exception e) {
            logger.warn("Invalid refresh token");
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Refresh token expired or invalid");
        }

        Long userId = Long.parseLong(claims.getSubject());

        // Fetch user
        User user = userRepo.findById(userId)
            .orElseThrow(() -> {
                logger.error("User not found for refresh: {}", userId);
                return new ResponseStatusException(HttpStatus.FORBIDDEN, "User not found");
            });

        // Detect token reuse: if token was previously revoked, it's a security threat
        if (jwtEnhancements.isRefreshTokenRevoked(refreshToken)) {
            logger.error("Refresh token reuse detected for user: {}", userId);
            
            // Token reuse detected — revoke all user's refresh tokens
            try {
                refreshRepo.deleteByUserId(userId);
            } catch (Exception e) {
                logger.error("Error deleting user's refresh tokens", e);
            }
            
            activityLogger.log(user.getTenantId(), user.getId(), user.getId(), 
                "REFRESH_TOKEN_REUSE", "SECURITY", user.getId(), 
                Map.of("incident", "Potential token compromise detected"));
                
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Refresh token reuse detected");
        }

        // Check token exists in persistent store (DB or in-memory)
        boolean existsInDb = refreshRepo.findByToken(refreshToken).isPresent();
        boolean existsInMemory = jwtEnhancements.isRefreshTokenPresent(refreshToken);
        
        if (!existsInDb && !existsInMemory) {
            logger.warn("Refresh token not found in store for user: {}", userId);
            activityLogger.log(user.getTenantId(), user.getId(), user.getId(), 
                "INVALID_REFRESH_TOKEN", "SECURITY", user.getId(),
                Map.of("email", user.getEmail(), "reason", "Token not found in store"));
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid refresh token");
        }

        // Verify account is active
        if (user.getAccountStatus() != AccountStatus.ACTIVE) {
            logger.warn("Refresh attempt for inactive user: {}", userId);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User inactive");
        }

        // Rotate refresh token: revoke old, issue new, persist new
        try {
            refreshRepo.deleteByToken(refreshToken);
        } catch (Exception e) {
            logger.error("Error deleting old refresh token", e);
        }
        
        // Mark old token as revoked to detect reuse
        jwtEnhancements.revokeRefreshToken(refreshToken, 
            java.time.Duration.ofMillis(jwtUtil.getRefreshExpiryMillis()));

        // Generate new refresh token
        String newRefresh = jwtUtil.generateRefreshToken(user.getId());
        RefreshToken rt = RefreshToken.builder()
            .userId(user.getId())
            .token(newRefresh)
            .createdAt(java.time.Instant.now())
            .build();
        refreshRepo.save(rt);
        
        // Store in in-memory storage as well
        jwtEnhancements.storeRefreshToken(newRefresh, user.getId(), 
            java.time.Duration.ofMillis(jwtUtil.getRefreshExpiryMillis()));

        // Generate new access token
        String accessToken = jwtUtil.generateAccessToken(
            user.getId(),
            user.getRole().name(),
            user.getTenantId(),
            permissionsForRole(user.getRole()),
            UUID.randomUUID().toString()
        );

        logger.info("Token refreshed for user: {}", userId);
        activityLogger.log(user.getTenantId(), user.getId(), user.getId(), 
            "REFRESH_TOKEN_ROTATED", "SECURITY", user.getId(),
            Map.of("email", user.getEmail()));

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