package com.stratumiq.backend.modules.admin.controller;

import com.stratumiq.backend.modules.admin.dto.*;
import com.stratumiq.backend.modules.admin.service.AdminSupportService;
import com.stratumiq.backend.security.AuthenticatedUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/support")
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
@Tag(name = "Admin Support", description = "Support ticket management")
public class AdminSupportController {

    private final AdminSupportService supportService;

    public AdminSupportController(AdminSupportService supportService) {
        this.supportService = supportService;
    }

    @GetMapping("/tickets")
    @PreAuthorize("hasAuthority('PERM_admin:support:view')")
    @Operation(summary = "List support tickets")
    public ResponseEntity<?> listTickets(
            @AuthenticationPrincipal AuthenticatedUser admin,
            @RequestParam(defaultValue = "all") String status,
            @RequestParam(required = false) Long assignedTo,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(
            supportService.listTickets(admin, status, assignedTo, search, page, limit));
    }

    @GetMapping("/tickets/{id}")
    @PreAuthorize("hasAuthority('PERM_admin:support:view')")
    @Operation(summary = "Get ticket detail with notes")
    public ResponseEntity<?> getTicket(
            @AuthenticationPrincipal AuthenticatedUser admin,
            @PathVariable Long id) {
        return ResponseEntity.ok(supportService.getTicket(admin, id));
    }

    @PostMapping("/tickets")
    @PreAuthorize("hasAuthority('PERM_admin:support:manage')")
    @Operation(summary = "Create support ticket")
    public ResponseEntity<?> createTicket(
            @AuthenticationPrincipal AuthenticatedUser admin,
            @Valid @RequestBody CreateTicketRequest req) {
        return ResponseEntity.status(201).body(supportService.createTicket(admin, req));
    }

    @PatchMapping("/tickets/{id}/assign")
    @PreAuthorize("hasAuthority('PERM_admin:support:manage')")
    @Operation(summary = "Assign ticket to admin")
    public ResponseEntity<?> assignTicket(
            @AuthenticationPrincipal AuthenticatedUser admin,
            @PathVariable Long id,
            @Valid @RequestBody AssignTicketRequest req) {
        return ResponseEntity.ok(supportService.assignTicket(admin, id, req));
    }

    @PatchMapping("/tickets/{id}/status")
    @PreAuthorize("hasAuthority('PERM_admin:support:manage')")
    @Operation(summary = "Update ticket status")
    public ResponseEntity<?> updateStatus(
            @AuthenticationPrincipal AuthenticatedUser admin,
            @PathVariable Long id,
            @Valid @RequestBody UpdateTicketStatusRequest req) {
        return ResponseEntity.ok(supportService.updateStatus(admin, id, req));
    }

    @PostMapping("/tickets/{id}/notes")
    @PreAuthorize("hasAuthority('PERM_admin:support:manage')")
    @Operation(summary = "Add internal note to ticket")
    public ResponseEntity<?> addNote(
            @AuthenticationPrincipal AuthenticatedUser admin,
            @PathVariable Long id,
            @Valid @RequestBody AddTicketNoteRequest req) {
        return ResponseEntity.ok(supportService.addNote(admin, id, req));
    }
}
