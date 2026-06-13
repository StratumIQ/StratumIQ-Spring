package com.stratumiq.backend.modules.admin.controller;

import com.stratumiq.backend.modules.admin.service.AdminFleetService;
import com.stratumiq.backend.security.AuthenticatedUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/fleet")
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
@Tag(name = "Admin Fleet", description = "Read-only fleet monitoring")
public class AdminFleetController {

    private final AdminFleetService fleetService;

    public AdminFleetController(AdminFleetService fleetService) {
        this.fleetService = fleetService;
    }

    @GetMapping("/equipment")
    @PreAuthorize("hasAuthority('PERM_admin:fleet:view')")
    @Operation(summary = "List all equipment")
    public ResponseEntity<?> listEquipment(
            @AuthenticationPrincipal AuthenticatedUser admin,
            @RequestParam(defaultValue = "all") String status,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(
            fleetService.listEquipment(admin, status, search, userId, page, limit));
    }

    @GetMapping("/equipment/{id}")
    @PreAuthorize("hasAuthority('PERM_admin:fleet:view')")
    @Operation(summary = "Get equipment detail")
    public ResponseEntity<?> getEquipment(
            @AuthenticationPrincipal AuthenticatedUser admin,
            @PathVariable Long id) {
        return ResponseEntity.ok(fleetService.getEquipment(admin, id));
    }

    @GetMapping("/health")
    @PreAuthorize("hasAuthority('PERM_admin:fleet:view')")
    @Operation(summary = "Equipment health summary")
    public ResponseEntity<?> health(@AuthenticationPrincipal AuthenticatedUser admin) {
        return ResponseEntity.ok(fleetService.getHealth(admin));
    }

    @GetMapping("/activity")
    @PreAuthorize("hasAuthority('PERM_admin:fleet:view')")
    @Operation(summary = "Recent fleet activity")
    public ResponseEntity<?> activity(
            @AuthenticationPrincipal AuthenticatedUser admin,
            @RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(fleetService.getActivity(admin, limit));
    }
}
