package com.stratumiq.backend.modules.admin.service;

import com.stratumiq.backend.common.enums.AccountStatus;
import com.stratumiq.backend.common.enums.Role;
import com.stratumiq.backend.entity.User;
import com.stratumiq.backend.modules.admin.dto.CreateUserRequest;
import com.stratumiq.backend.modules.admin.dto.UpdateUserRequest;
import com.stratumiq.backend.modules.admin.dto.UpdateUserStatusRequest;
import com.stratumiq.backend.modules.admin.dto.UpdateUserRoleRequest;
import com.stratumiq.backend.modules.admin.mapper.AdminMapper;
import com.stratumiq.backend.modules.admin.response.AdminUserResponse;
import com.stratumiq.backend.modules.admin.specification.AdminSpecifications;
import com.stratumiq.backend.repository.UserRepository;
import com.stratumiq.backend.security.AuthenticatedUser;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.Year;
import java.util.*;

@Service
public class AdminUserService {

    private final UserRepository userRepo;
    private final AdminMapper mapper;
    private final AdminActivityLogger activityLogger;
    private final BCryptPasswordEncoder encoder;

    public AdminUserService(UserRepository userRepo,
                            AdminMapper mapper,
                            AdminActivityLogger activityLogger,
                            BCryptPasswordEncoder encoder) {
        this.userRepo = userRepo;
        this.mapper = mapper;
        this.activityLogger = activityLogger;
        this.encoder = encoder;
    }

    // ─── List ─────────────────────────────────────────────────────────────────

    public Map<String, Object> listUsers(AuthenticatedUser admin,
            String search, String role, String status, int page, int limit) {
        Long tenantId = AdminScope.tenantFilter(admin);
        Pageable pageable = PageRequest.of(page - 1, limit,
            Sort.by(Sort.Direction.DESC, "createdAt"));

        var spec = AdminSpecifications.users(tenantId, search, role, status);
        Page<User> result = userRepo.findAll(spec, pageable);

        List<AdminUserResponse> users = result.getContent().stream()
            .map(mapper::toUserResponse)
            .toList();

        return Map.of(
            "users", users,
            "pagination", Map.of(
                "page", page,
                "limit", limit,
                "total", result.getTotalElements(),
                "totalPages", result.getTotalPages()
            )
        );
    }

    // ─── Get single ───────────────────────────────────────────────────────────

    public AdminUserResponse getUser(AuthenticatedUser admin, Long id) {
        User user = findScopedUser(admin, id);
        return mapper.toUserResponse(user);
    }

    // ─── Manual user creation by admin ────────────────────────────────────────

    /**
     * Admin manually creates a new platform user.
     *
     * Password formula: LastName@CurrentYear1234
     * Example: if lastName = "Kumar" and year = 2026 → "Kumar@20261234"
     *
     * Username for login = email address.
     * Account is set to ACTIVE immediately (no OTP flow for admin-created users).
     * The generated plain-text password is returned once so admin can share it securely.
     */
    @Transactional
    public Map<String, Object> createUser(AuthenticatedUser admin, CreateUserRequest req) {
        String email = req.email().trim().toLowerCase();

        if (userRepo.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "A user with this email address already exists.");
        }

        // Build the standard default password: LastName@CurrentYear1234
        String plainPassword = buildDefaultPassword(req.lastName().trim());

        // Determine tenantId — SUPER_ADMIN creates platform-level users (tenantId = null),
        // ADMIN creates users within their own tenant.
        Long tenantId = AdminScope.isSuperAdmin(admin) ? null : admin.tenantId();

        User user = User.builder()
            .firstName(req.firstName().trim())
            .lastName(req.lastName().trim())
            .email(email)
            .phone(req.phone() != null ? req.phone().trim() : null)
            .password(encoder.encode(plainPassword))
            .role(Role.USER)
            .accountStatus(AccountStatus.ACTIVE)
            .emailVerified(true)   // admin-created accounts skip verification
            .phoneVerified(false)
            .tenantId(tenantId)
            .build();

        user = userRepo.save(user);

        activityLogger.log(
            user.getTenantId(),
            user.getId(),
            admin.userId(),
            "USER_CREATED_BY_ADMIN",
            "USER",
            user.getId(),
            Map.of("email", user.getEmail(), "createdBy", admin.userId())
        );

        // Return the plain password once — admin must share it securely with the user.
        return Map.of(
            "user", mapper.toUserResponse(user),
            "defaultPassword", plainPassword,
            "message", "User created successfully. Share the default password securely. " +
                       "The user should change it on first login."
        );
    }

    // ─── Update profile ───────────────────────────────────────────────────────

    @Transactional
    public AdminUserResponse updateUser(AuthenticatedUser admin, Long id, UpdateUserRequest req) {
        User user = findScopedUser(admin, id);

        if (req.firstName() != null) user.setFirstName(req.firstName());
        if (req.lastName() != null) user.setLastName(req.lastName());
        if (req.phone() != null) user.setPhone(req.phone());
        if (req.email() != null && !req.email().equalsIgnoreCase(user.getEmail())) {
            if (userRepo.existsByEmail(req.email().toLowerCase())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
            }
            user.setEmail(req.email().toLowerCase());
        }

        user = userRepo.save(user);
        logAction(admin, user, "USER_UPDATED");
        return mapper.toUserResponse(user);
    }

    // ─── Update status ────────────────────────────────────────────────────────

    @Transactional
    public AdminUserResponse updateStatus(AuthenticatedUser admin, Long id, UpdateUserStatusRequest req) {
        User user = findScopedUser(admin, id);
        AccountStatus newStatus;
        try {
            newStatus = AccountStatus.valueOf(req.status().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Invalid status. Use ACTIVE or BANNED.");
        }

        if (newStatus != AccountStatus.ACTIVE && newStatus != AccountStatus.BANNED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Only ACTIVE and BANNED are allowed for admin status updates.");
        }

        user.setAccountStatus(newStatus);
        user = userRepo.save(user);
        logAction(admin, user, "USER_STATUS_" + newStatus.name());
        return mapper.toUserResponse(user);
    }

    // ─── Update role ──────────────────────────────────────────────────────────

    @Transactional
    public AdminUserResponse updateRole(AuthenticatedUser admin, Long id, UpdateUserRoleRequest req) {
        User user = findScopedUser(admin, id);
        Role newRole;
        try {
            newRole = Role.valueOf(req.role().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role.");
        }

        if (newRole == Role.SUPER_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "SUPER_ADMIN role cannot be assigned via this endpoint.");
        }

        if (newRole == Role.ADMIN && !AdminScope.isSuperAdmin(admin)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Only SUPER_ADMIN can assign ADMIN role.");
        }

        user.setRole(newRole);
        user = userRepo.save(user);
        logAction(admin, user, "USER_ROLE_" + newRole.name());
        return mapper.toUserResponse(user);
    }

    // ─── Reset password ───────────────────────────────────────────────────────

    @Transactional
    public Map<String, Object> resetPassword(AuthenticatedUser admin, Long id) {
        User user = findScopedUser(admin, id);
        String tempPassword = generateTempPassword();
        user.setPassword(encoder.encode(tempPassword));
        userRepo.save(user);
        logAction(admin, user, "USER_PASSWORD_RESET");
        return Map.of(
            "message", "Temporary password generated. Share securely with the user.",
            "temporaryPassword", tempPassword
        );
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Builds the standard default password for admin-created accounts.
     * Formula: LastName@CurrentYear1234
     * e.g. lastName="bangad" → "Bangad@20261234"
     */
    private String buildDefaultPassword(String lastName) {
        // Capitalise first letter for a consistent format
        String capitalized = lastName.isEmpty()
            ? "User"
            : Character.toUpperCase(lastName.charAt(0)) + lastName.substring(1).toLowerCase();
        int currentYear = Year.now().getValue();
        return capitalized + "@" + currentYear + "1234";
    }

    private User findScopedUser(AuthenticatedUser admin, Long id) {
        User user = userRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getDeletedAt() != null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }

        Long tenantId = AdminScope.tenantFilter(admin);
        if (tenantId != null && !tenantId.equals(user.getTenantId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        return user;
    }

    private void logAction(AuthenticatedUser admin, User target, String action) {
        activityLogger.log(
            target.getTenantId(),
            target.getId(),
            admin.userId(),
            action,
            "USER",
            target.getId(),
            Map.of("email", target.getEmail())
        );
    }

    private String generateTempPassword() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 12; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }
}