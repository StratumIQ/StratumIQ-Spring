package com.stratumiq.backend.modules.admin.controller;

import com.stratumiq.backend.modules.admin.dto.*;
import com.stratumiq.backend.modules.admin.service.AdminUserService;
import com.stratumiq.backend.security.AuthenticatedUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
@Tag(name = "Admin Users", description = "User management for administrators")
public class AdminUserController {

    private final AdminUserService userService;

    public AdminUserController(AdminUserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('PERM_admin:users:view')")
    @Operation(summary = "List users with search and filters")
    public ResponseEntity<?> list(
            @AuthenticationPrincipal AuthenticatedUser admin,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "all") String role,
            @RequestParam(defaultValue = "all") String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(userService.listUsers(admin, search, role, status, page, limit));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PERM_admin:users:view')")
    @Operation(summary = "Get user detail")
    public ResponseEntity<?> get(
            @AuthenticationPrincipal AuthenticatedUser admin,
            @PathVariable Long id) {
        return ResponseEntity.ok(userService.getUser(admin, id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PERM_admin:users:edit')")
    @Operation(summary = "Update user profile")
    public ResponseEntity<?> update(
            @AuthenticationPrincipal AuthenticatedUser admin,
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest req) {
        return ResponseEntity.ok(userService.updateUser(admin, id, req));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('PERM_admin:users:edit')")
    @Operation(summary = "Activate or disable user")
    public ResponseEntity<?> updateStatus(
            @AuthenticationPrincipal AuthenticatedUser admin,
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserStatusRequest req) {
        return ResponseEntity.ok(userService.updateStatus(admin, id, req));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasAuthority('PERM_admin:users:edit')")
    @Operation(summary = "Assign user role")
    public ResponseEntity<?> updateRole(
            @AuthenticationPrincipal AuthenticatedUser admin,
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRoleRequest req) {
        return ResponseEntity.ok(userService.updateRole(admin, id, req));
    }

    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasAuthority('PERM_admin:users:edit')")
    @Operation(summary = "Reset user password")
    public ResponseEntity<?> resetPassword(
            @AuthenticationPrincipal AuthenticatedUser admin,
            @PathVariable Long id) {
        return ResponseEntity.ok(userService.resetPassword(admin, id));
    }
}
