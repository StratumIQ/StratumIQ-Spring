package com.stratumiq.backend.modules.fleet;

import com.stratumiq.backend.modules.fleet.dto.*;
import com.stratumiq.backend.security.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// Replaces fleet.controller.js + fleet.routes.js
// All 14 endpoints — same paths, same response shapes
@RestController
@RequestMapping("/api/fleet")
public class FleetController {

    private final FleetService fleetService;

    public FleetController(FleetService fleetService) {
        this.fleetService = fleetService;
    }

    // ── Equipment ─────────────────────────────────────────────────────────

    // POST /api/fleet — replaces registerEquipment
    @PostMapping
    @PreAuthorize("hasAuthority('PERM_fleet:create') or hasRole('ADMIN')")
    public ResponseEntity<?> registerEquipment(
            @Valid @RequestBody CreateEquipmentRequest req,
            @AuthenticationPrincipal AuthenticatedUser user) {
        var equipment = fleetService.createEquipment(user.userId(), req);
        return ResponseEntity.status(201)
            .body(Map.of("message", "Equipment registered.", "equipment", equipment));
    }

    // GET /api/fleet — replaces getFleet (paginated + filtered)
    @GetMapping
    @PreAuthorize("hasAuthority('PERM_fleet:view') or hasRole('ADMIN')")
    public ResponseEntity<?> getFleet(
            @RequestParam(defaultValue = "all")  String status,
            @RequestParam(defaultValue = "all")  String category,
            @RequestParam(defaultValue = "")     String search,
            @RequestParam(defaultValue = "1")    int page,
            @RequestParam(defaultValue = "20")   int limit,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(
            fleetService.listEquipment(user.userId(), status, category, search, page, limit));
    }

    // GET /api/fleet/summary — MUST be before /{id}
    @GetMapping("/summary")
    @PreAuthorize("hasAuthority('PERM_fleet:view') or hasRole('ADMIN')")
    public ResponseEntity<?> getFleetSummary(
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(
            Map.of("summary", fleetService.getFleetSummary(user.userId())));
    }

    // GET /api/fleet/{id}
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PERM_fleet:view') or hasRole('ADMIN')")
    public ResponseEntity<?> getEquipment(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(
            Map.of("equipment", fleetService.findById(id, user.userId())));
    }

    // PUT /api/fleet/{id}
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PERM_fleet:edit') or hasRole('ADMIN')")
    public ResponseEntity<?> editEquipment(
            @PathVariable Long id,
            @RequestBody UpdateEquipmentRequest req,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(Map.of(
            "message",   "Equipment updated.",
            "equipment", fleetService.updateEquipment(id, user.userId(), req)));
    }

    // PATCH /api/fleet/{id}/status
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('PERM_fleet:edit') or hasRole('ADMIN')")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(Map.of(
            "message",   "Status updated.",
            "equipment", fleetService.updateStatus(id, user.userId(), body.get("status"))));
    }

    // PATCH /api/fleet/{id}/hours
    @PatchMapping("/{id}/hours")
    @PreAuthorize("hasAuthority('PERM_fleet:edit') or hasRole('ADMIN')")
    public ResponseEntity<?> updateHours(
            @PathVariable Long id,
            @Valid @RequestBody LogOperationRequest req,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(Map.of(
            "message",   "Running hours updated.",
            "operation", fleetService.logOperation(id, user.userId(), req)));
    }

    // DELETE /api/fleet/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PERM_fleet:delete') or hasRole('ADMIN')")
    public ResponseEntity<?> removeEquipment(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user) {
        fleetService.deleteEquipment(id, user.userId());
        return ResponseEntity.ok(Map.of("message", "Equipment removed."));
    }

    // ── Service Records ───────────────────────────────────────────────────

    // POST /api/fleet/{id}/service-records
    @PostMapping("/{id}/service-records")
    @PreAuthorize("hasAuthority('PERM_maintenance:create') or hasRole('ADMIN')")
    public ResponseEntity<?> addServiceRecord(
            @PathVariable Long id,
            @Valid @RequestBody CreateServiceRecordRequest req,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.status(201).body(Map.of(
            "message", "Service record added.",
            "record",  fleetService.createServiceRecord(id, user.userId(), req)));
    }

    // GET /api/fleet/{id}/service-records
    @GetMapping("/{id}/service-records")
    @PreAuthorize("hasAuthority('PERM_maintenance:view') or hasRole('ADMIN')")
    public ResponseEntity<?> getServiceRecords(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(
            Map.of("records", fleetService.listServiceRecords(id, user.userId())));
    }

    // DELETE /api/fleet/{id}/service-records/{recordId}
    @DeleteMapping("/{id}/service-records/{recordId}")
    @PreAuthorize("hasAuthority('PERM_maintenance:edit') or hasRole('ADMIN')")
    public ResponseEntity<?> removeServiceRecord(
            @PathVariable Long id,
            @PathVariable Long recordId,
            @AuthenticationPrincipal AuthenticatedUser user) {
        fleetService.deleteServiceRecord(recordId, id, user.userId());
        return ResponseEntity.ok(Map.of("message", "Service record removed."));
    }

    // ── Operations Log ────────────────────────────────────────────────────

    // POST /api/fleet/{id}/operations
    @PostMapping("/{id}/operations")
    @PreAuthorize("hasAuthority('PERM_fleet:edit') or hasRole('ADMIN')")
    public ResponseEntity<?> addOperation(
            @PathVariable Long id,
            @Valid @RequestBody LogOperationRequest req,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.status(201).body(Map.of(
            "message",   "Operation logged.",
            "operation", fleetService.logOperation(id, user.userId(), req)));
    }

    // GET /api/fleet/{id}/operations
    @GetMapping("/{id}/operations")
    @PreAuthorize("hasAuthority('PERM_fleet:view') or hasRole('ADMIN')")
    public ResponseEntity<?> getOperations(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(
            Map.of("operations", fleetService.listOperations(id, user.userId())));
    }
}