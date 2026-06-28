package com.stratumiq.backend.modules.admin.controller;

import com.stratumiq.backend.modules.admin.dto.AdminAssignFleetRequest;
import com.stratumiq.backend.modules.admin.service.AdminFleetService;
import com.stratumiq.backend.security.AuthenticatedUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/fleet")
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
@Tag(name = "Admin Fleet", description = "Fleet monitoring and admin equipment assignment")
public class AdminFleetController {

    private final AdminFleetService fleetService;

    public AdminFleetController(AdminFleetService fleetService) {
        this.fleetService = fleetService;
    }

    @GetMapping("/equipment")
    @PreAuthorize("hasAuthority('PERM_admin:fleet:view')")
    @Operation(summary = "List all equipment across the platform")
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

    /**
     * Admin adds a new piece of equipment and assigns it to a specific user.
     * The equipment immediately appears in the user's fleet dashboard.
     *
     * Request body must include: userId (target user), name, serialNumber.
     * Optional: make, model, year, category, status (defaults to ACTIVE).
     */
    @PostMapping("/equipment")
    @PreAuthorize("hasAuthority('PERM_admin:fleet:manage')")
    @Operation(summary = "Admin adds equipment and assigns it to a user")
    public ResponseEntity<?> addEquipment(
            @AuthenticationPrincipal AuthenticatedUser admin,
            @Valid @RequestBody AdminAssignFleetRequest req) {
        return ResponseEntity.status(201).body(fleetService.adminAddEquipment(admin, req));
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