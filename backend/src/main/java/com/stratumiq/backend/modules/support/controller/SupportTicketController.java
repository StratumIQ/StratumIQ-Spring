package com.stratumiq.backend.modules.support.controller;

import com.stratumiq.backend.modules.support.dto.CreateSupportTicketNoteRequest;
import com.stratumiq.backend.modules.support.dto.CreateSupportTicketRequest;
import com.stratumiq.backend.modules.support.dto.SupportTicketResponse;
import com.stratumiq.backend.modules.support.service.SupportTicketService;
import com.stratumiq.backend.security.AuthenticatedUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;

@RestController
@RequestMapping("/api/support")
public class SupportTicketController {

    private final SupportTicketService supportTicketService;

    public SupportTicketController(
            SupportTicketService supportTicketService
    ) {
        this.supportTicketService = supportTicketService;
    }

    @PostMapping("/tickets")
    @ResponseStatus(HttpStatus.CREATED)
    public SupportTicketResponse create(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody CreateSupportTicketRequest request
    ) {

        return supportTicketService.create(
                user.userId(),
                user.tenantId(),
                request
        );
    }

    @GetMapping("/tickets")
    public List<SupportTicketResponse> getMyTickets(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer limit
    ) {

        return supportTicketService.getMyTickets(
                user.userId(), status, search, page, limit
        );
    }

    @PostMapping("/tickets/{ticketId}/notes")
    public SupportTicketResponse addNote(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable Long ticketId,
            @Valid @RequestBody CreateSupportTicketNoteRequest request
    ) {
        return supportTicketService.addNote(user.userId(), ticketId, request);
    }

    @GetMapping("/tickets/{ticketId}")
    public SupportTicketResponse getById(
            @PathVariable Long ticketId,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {

        return supportTicketService.getById(
                ticketId,
                user.userId()
        );
    }
}