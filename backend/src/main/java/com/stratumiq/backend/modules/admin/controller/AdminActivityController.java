package com.stratumiq.backend.modules.admin.controller;

import com.stratumiq.backend.modules.admin.service.AdminActivityService;
import com.stratumiq.backend.security.AuthenticatedUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/activity")
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
@Tag(name = "Admin Activity", description = "Activity monitoring and audit trail")
public class AdminActivityController {

    private final AdminActivityService activityService;

    public AdminActivityController(AdminActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('PERM_admin:activity:view')")
    @Operation(summary = "List user and platform activity with filters")
    public ResponseEntity<?> list(
            @AuthenticationPrincipal AuthenticatedUser admin,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "all") String category,
            @RequestParam(defaultValue = "all") String action,
            @RequestParam(defaultValue = "all") String entityType,
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "") String from,
            @RequestParam(defaultValue = "") String to,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(activityService.listActivities(
            admin, search, category, action, entityType, userId, from, to, page, limit));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAuthority('PERM_admin:activity:view')")
    @Operation(summary = "Get activity monitoring summary")
    public ResponseEntity<?> summary(
            @AuthenticationPrincipal AuthenticatedUser admin,
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(activityService.getSummary(admin, days));
    }
}
