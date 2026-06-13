package com.stratumiq.backend.modules.admin.service;

import com.stratumiq.backend.common.enums.AccountStatus;
import com.stratumiq.backend.common.enums.Role;
import com.stratumiq.backend.entity.User;
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

    public AdminUserResponse getUser(AuthenticatedUser admin, Long id) {
        User user = findScopedUser(admin, id);
        return mapper.toUserResponse(user);
    }

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
