package com.stratumiq.backend.modules.admin.service;

import com.stratumiq.backend.common.enums.TicketPriority;
import com.stratumiq.backend.common.enums.TicketStatus;
import com.stratumiq.backend.entity.SupportTicket;
import com.stratumiq.backend.entity.SupportTicketNote;
import com.stratumiq.backend.entity.User;
import com.stratumiq.backend.modules.admin.dto.CreateTicketRequest;
import com.stratumiq.backend.modules.admin.dto.AssignTicketRequest;
import com.stratumiq.backend.modules.admin.dto.UpdateTicketStatusRequest;
import com.stratumiq.backend.modules.admin.dto.AddTicketNoteRequest;
import com.stratumiq.backend.modules.admin.mapper.AdminMapper;
import com.stratumiq.backend.modules.admin.response.AdminTicketResponse;
import com.stratumiq.backend.modules.admin.specification.AdminSpecifications;
import com.stratumiq.backend.repository.SupportTicketNoteRepository;
import com.stratumiq.backend.repository.SupportTicketRepository;
import com.stratumiq.backend.repository.UserRepository;
import com.stratumiq.backend.security.AuthenticatedUser;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import java.time.Year;
import java.util.*;

@Service
public class AdminSupportService {

    private final SupportTicketRepository ticketRepo;
    private final SupportTicketNoteRepository noteRepo;
    private final UserRepository userRepo;
    private final AdminMapper mapper;
    private final AdminActivityLogger activityLogger;

    public AdminSupportService(SupportTicketRepository ticketRepo,
                               SupportTicketNoteRepository noteRepo,
                               UserRepository userRepo,
                               AdminMapper mapper,
                               AdminActivityLogger activityLogger) {
        this.ticketRepo = ticketRepo;
        this.noteRepo = noteRepo;
        this.userRepo = userRepo;
        this.mapper = mapper;
        this.activityLogger = activityLogger;
    }

    public Map<String, Object> listTickets(AuthenticatedUser admin,
            String status, Long assignedTo, String search, int page, int limit) {
        Long tenantId = AdminScope.tenantFilter(admin);
        Pageable pageable = PageRequest.of(page - 1, limit,
            Sort.by(Sort.Direction.DESC, "createdAt"));

        var spec = AdminSpecifications.tickets(tenantId, status, assignedTo, search);
        Page<SupportTicket> result = ticketRepo.findAll(spec, pageable);

        List<AdminTicketResponse> tickets = result.getContent().stream()
            .map(t -> mapper.toTicketResponse(t, List.of()))
            .toList();

        return Map.of(
            "tickets", tickets,
            "pagination", Map.of(
                "page", page,
                "limit", limit,
                "total", result.getTotalElements(),
                "totalPages", result.getTotalPages()
            )
        );
    }

    public AdminTicketResponse getTicket(AuthenticatedUser admin, Long id) {
        SupportTicket ticket = findScopedTicket(admin, id);
        var notes = noteRepo.findByTicketIdOrderByCreatedAtAsc(id);
        return mapper.toTicketResponse(ticket, notes);
    }

    @Transactional
    public AdminTicketResponse createTicket(AuthenticatedUser admin, CreateTicketRequest req) {
        User customer = userRepo.findById(req.userId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));

        Long tenantId = AdminScope.tenantFilter(admin);
        if (tenantId != null && !tenantId.equals(customer.getTenantId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        TicketPriority priority = TicketPriority.MEDIUM;
        if (req.priority() != null && !req.priority().isBlank()) {
            try {
                priority = TicketPriority.valueOf(req.priority().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid priority.");
            }
        }

        SupportTicket ticket = SupportTicket.builder()
            .ticketNumber(generateTicketNumber())
            .userId(customer.getId())
            .tenantId(customer.getTenantId())
            .subject(req.subject())
            .description(req.description())
            .status(TicketStatus.OPEN)
            .priority(priority)
            .createdBy(admin.userId())
            .build();

        ticket = ticketRepo.save(ticket);
        logTicketAction(admin, ticket, "TICKET_CREATED");
        return mapper.toTicketResponse(ticket, List.of());
    }

    @Transactional
    public AdminTicketResponse assignTicket(AuthenticatedUser admin, Long id, AssignTicketRequest req) {
        SupportTicket ticket = findScopedTicket(admin, id);
        User assignee = userRepo.findById(req.assignedTo())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignee not found"));

        if (assignee.getRole() != com.stratumiq.backend.common.enums.Role.ADMIN
            && assignee.getRole() != com.stratumiq.backend.common.enums.Role.SUPER_ADMIN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Tickets can only be assigned to ADMIN or SUPER_ADMIN users.");
        }

        ticket.setAssignedTo(assignee.getId());
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.ASSIGNED);
        }
        ticket = ticketRepo.save(ticket);
        logTicketAction(admin, ticket, "TICKET_ASSIGNED");
        return getTicket(admin, id);
    }

    @Transactional
    public AdminTicketResponse updateStatus(AuthenticatedUser admin, Long id, UpdateTicketStatusRequest req) {
        SupportTicket ticket = findScopedTicket(admin, id);
        TicketStatus newStatus;
        try {
            newStatus = TicketStatus.valueOf(req.status().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid ticket status.");
        }

        validateTransition(ticket.getStatus(), newStatus);
        ticket.setStatus(newStatus);

        if (newStatus == TicketStatus.RESOLVED) {
            ticket.setResolvedAt(Instant.now());
        } else {
            ticket.setResolvedAt(null);
        }

        ticket = ticketRepo.save(ticket);
        logTicketAction(admin, ticket, "TICKET_STATUS_" + newStatus.name());
        return getTicket(admin, id);
    }

    @Transactional
    public AdminTicketResponse addNote(AuthenticatedUser admin, Long id, AddTicketNoteRequest req) {
        SupportTicket ticket = findScopedTicket(admin, id);

        SupportTicketNote note = SupportTicketNote.builder()
            .ticketId(id)
            .authorId(admin.userId())
            .body(req.body())
            .isInternal(req.isInternal() != null ? req.isInternal() : true)
            .build();
        noteRepo.save(note);

        logTicketAction(admin, ticket, "TICKET_NOTE_ADDED");
        return getTicket(admin, id);
    }

    private SupportTicket findScopedTicket(AuthenticatedUser admin, Long id) {
        SupportTicket ticket = ticketRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));

        if (ticket.getDeletedAt() != null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found");
        }

        Long tenantId = AdminScope.tenantFilter(admin);
        if (tenantId != null && !tenantId.equals(ticket.getTenantId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        return ticket;
    }

    private void validateTransition(TicketStatus current, TicketStatus next) {
        if (current == next) return;
        Set<TicketStatus> allowed = switch (current) {
            case OPEN -> EnumSet.of(TicketStatus.ASSIGNED, TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED);
            case ASSIGNED -> EnumSet.of(TicketStatus.IN_PROGRESS, TicketStatus.WAITING_CUSTOMER, TicketStatus.RESOLVED);
            case IN_PROGRESS -> EnumSet.of(TicketStatus.WAITING_CUSTOMER, TicketStatus.RESOLVED, TicketStatus.ASSIGNED);
            case WAITING_CUSTOMER -> EnumSet.of(TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED);
            case RESOLVED -> EnumSet.of(TicketStatus.OPEN, TicketStatus.IN_PROGRESS);
        };
        if (!allowed.contains(next)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Cannot transition from " + current + " to " + next);
        }
    }

    private String generateTicketNumber() {
        String prefix = "TKT-" + Year.now().getValue() + "-";
        String max = ticketRepo.findMaxTicketNumberWithPrefix(prefix);
        int next = 1;
        if (max != null && max.startsWith(prefix)) {
            try {
                next = Integer.parseInt(max.substring(prefix.length())) + 1;
            } catch (NumberFormatException ignored) {}
        }
        return prefix + String.format("%05d", next);
    }

    private void logTicketAction(AuthenticatedUser admin, SupportTicket ticket, String action) {
        activityLogger.log(
            ticket.getTenantId(),
            ticket.getUserId(),
            admin.userId(),
            action,
            "SUPPORT_TICKET",
            ticket.getId(),
            Map.of("ticketNumber", ticket.getTicketNumber())
        );
    }
}
