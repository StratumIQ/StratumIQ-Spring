package com.stratumiq.backend.modules.admin.controller;

import com.stratumiq.backend.modules.admin.service.AdminDashboardService;
import com.stratumiq.backend.security.AuthenticatedUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
@Tag(name = "Admin Dashboard", description = "Executive dashboard KPIs and charts")
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    public AdminDashboardController(AdminDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/kpis")
    @Operation(summary = "Get platform KPIs")
    public ResponseEntity<?> kpis(@AuthenticationPrincipal AuthenticatedUser admin) {
        return ResponseEntity.ok(dashboardService.getKpis(admin));
    }

    @GetMapping("/user-growth")
    @Operation(summary = "User registration growth chart")
    public ResponseEntity<?> userGrowth(
            @AuthenticationPrincipal AuthenticatedUser admin,
            @RequestParam(defaultValue = "90") int days) {
        return ResponseEntity.ok(dashboardService.getUserGrowth(admin, days));
    }

    @GetMapping("/fleet-growth")
    @Operation(summary = "Equipment registration growth chart")
    public ResponseEntity<?> fleetGrowth(
            @AuthenticationPrincipal AuthenticatedUser admin,
            @RequestParam(defaultValue = "90") int days) {
        return ResponseEntity.ok(dashboardService.getFleetGrowth(admin, days));
    }

    @GetMapping("/activity-timeline")
    @Operation(summary = "Platform activity timeline")
    public ResponseEntity<?> activityTimeline(
            @AuthenticationPrincipal AuthenticatedUser admin,
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(dashboardService.getActivityTimeline(admin, days));
    }

    @GetMapping("/recent-activities")
    @Operation(summary = "Recent platform activities")
    public ResponseEntity<?> recentActivities(
            @AuthenticationPrincipal AuthenticatedUser admin,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(dashboardService.getRecentActivities(admin, limit));
    }

    @GetMapping("/marketing-highlights")
    @Operation(summary = "Marketing highlights (placeholder until Marketing module)")
    public ResponseEntity<?> marketingHighlights() {
        return ResponseEntity.ok(dashboardService.getMarketingHighlights());
    }
}
