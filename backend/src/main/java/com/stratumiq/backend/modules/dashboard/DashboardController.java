package com.stratumiq.backend.modules.dashboard;

import com.stratumiq.backend.security.AuthenticatedUser;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// Replaces dashboard.controller.js + dashboard.routes.js
// All routes require JWT (SecurityConfig enforces this for /api/dashboard/**)
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    // ── Core ──────────────────────────────────────────────────────────────

    // GET /api/dashboard/stats
    @GetMapping("/stats")
    public ResponseEntity<?> stats(
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(dashboardService.getDashboardStats(user.userId()));
    }

    // GET /api/dashboard/activity
    @GetMapping("/activity")
    public ResponseEntity<?> activity(
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(dashboardService.getRecentActivity(user.userId()));
    }

    // GET /api/dashboard/profile
    @GetMapping("/profile")
    public ResponseEntity<?> profile(
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(dashboardService.getUserProfile(user.userId()));
    }

    // POST /api/dashboard/onboarding/complete — stub
    @PostMapping("/onboarding/complete")
    public ResponseEntity<?> finishOnboarding(
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(Map.of("ok", true));
    }

    // POST /api/dashboard/seed-demo — stub
    @PostMapping("/seed-demo")
    public ResponseEntity<?> seedDemo(
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(Map.of("ok", true, "message", "Demo seed coming soon"));
    }

    // ── AI & Intelligence ─────────────────────────────────────────────────

    // GET /api/dashboard/ai-summary
    @GetMapping("/ai-summary")
    public ResponseEntity<?> aiSummary(
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(dashboardService.getAISummary(user.userId()));
    }

    // GET /api/dashboard/news
    @GetMapping("/news")
    public ResponseEntity<?> news() {
        return ResponseEntity.ok(dashboardService.getNews());
    }

    // GET /api/dashboard/predictive
    @GetMapping("/predictive")
    public ResponseEntity<?> predictive(
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(dashboardService.getPredictiveMaintenance(user.userId()));
    }

    // GET /api/dashboard/production
    @GetMapping("/production")
    public ResponseEntity<?> production(
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(dashboardService.getProductionPerformance(user.userId()));
    }

    // ── Alerts — literal paths BEFORE /{id} ──────────────────────────────

    // GET /api/dashboard/alerts
    @GetMapping("/alerts")
    public ResponseEntity<?> listAlerts(
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(dashboardService.getAlerts(user.userId()));
    }

    // PATCH /api/dashboard/alerts/read-all ← MUST be before /:id
    @PatchMapping("/alerts/read-all")
    public ResponseEntity<?> readAllAlerts(
            @AuthenticationPrincipal AuthenticatedUser user) {
        dashboardService.markAllAlertsRead(user.userId());
        return ResponseEntity.ok(Map.of("ok", true));
    }

    // PATCH /api/dashboard/alerts/{id}/read
    @PatchMapping("/alerts/{id}/read")
    public ResponseEntity<?> readAlert(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user) {
        dashboardService.markAlertRead(id, user.userId());
        return ResponseEntity.ok(Map.of("ok", true));
    }

    // ── Fleet ─────────────────────────────────────────────────────────────

    // GET /api/dashboard/fleet
    @GetMapping("/fleet")
    @PreAuthorize("hasAuthority('PERM_fleet:view') or hasRole('ADMIN')")
    public ResponseEntity<?> listFleet(
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(dashboardService.getFleet(user.userId()));
    }

    // POST /api/dashboard/fleet
    @PostMapping("/fleet")
    @PreAuthorize("hasAuthority('PERM_fleet:create') or hasRole('ADMIN')")
    public ResponseEntity<?> createEquipment(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.status(201)
            .body(dashboardService.addEquipment(user.userId(), body));
    }

    // PATCH /api/dashboard/fleet/{id}/status
    @PatchMapping("/fleet/{id}/status")
    @PreAuthorize("hasAuthority('PERM_fleet:edit') or hasRole('ADMIN')")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(
            dashboardService.updateEquipmentStatus(id, user.userId(), body.get("status")));
    }

    // ── Parts ─────────────────────────────────────────────────────────────

    // GET /api/dashboard/parts
    @GetMapping("/parts")
    public ResponseEntity<?> listParts(
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(dashboardService.getParts(user.userId()));
    }

    // POST /api/dashboard/parts
    @PostMapping("/parts")
    public ResponseEntity<?> createPart(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.status(201)
            .body(dashboardService.addPart(user.userId(), body));
    }

    // ── Maintenance ───────────────────────────────────────────────────────

    // GET /api/dashboard/maintenance
    @GetMapping("/maintenance")
    public ResponseEntity<?> listMaintenance(
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(dashboardService.getMaintenance(user.userId()));
    }

    // POST /api/dashboard/maintenance
    @PostMapping("/maintenance")
    public ResponseEntity<?> createMaintenance(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.status(201)
            .body(dashboardService.addMaintenance(user.userId(), body));
    }
}