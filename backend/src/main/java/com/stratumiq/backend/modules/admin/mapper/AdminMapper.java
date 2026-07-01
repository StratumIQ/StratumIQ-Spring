package com.stratumiq.backend.modules.admin.mapper;

import com.stratumiq.backend.entity.*;
import com.stratumiq.backend.modules.admin.response.*;
import com.stratumiq.backend.repository.UserRepository;
import org.springframework.stereotype.Component;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class AdminMapper {

    private final UserRepository userRepo;

    public AdminMapper(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    public AdminUserResponse toUserResponse(User user) {
        return new AdminUserResponse(
            user.getId(),
            user.getFirstName(),
            user.getLastName(),
            user.getEmail(),
            user.getPhone(),
            user.getRole().name(),
            user.getAccountStatus().name(),
            user.getTenantId(),
            user.getEmailVerified(),
            user.getPhoneVerified(),
            user.getCreatedAt(),
            user.getLastLoginAt()
        );
    }

    public AdminEquipmentResponse toEquipmentResponse(FleetEquipment eq) {
        User owner = userRepo.findById(eq.getUserId()).orElse(null);
        String ownerName = owner != null
            ? (owner.getFirstName() + " " + owner.getLastName()).trim()
            : "Unknown";
        return new AdminEquipmentResponse(
            eq.getId(),
            eq.getUserId(),
            ownerName,
            owner != null ? owner.getEmail() : null,
            eq.getName(),
            eq.getCategory() != null ? eq.getCategory().name() : null,
            eq.getSerialNumber(),
            eq.getBrand(),
            eq.getModel(),
            eq.getStatus().name(),
            eq.getRunningHours(),
            eq.getLocation(),
            eq.getCreatedAt(),
            eq.getUpdatedAt()
        );
    }

    public AdminTicketResponse toTicketResponse(SupportTicket ticket, List<SupportTicketNote> notes) {
        User customer = userRepo.findById(ticket.getUserId()).orElse(null);
        User assignee = ticket.getAssignedTo() != null
            ? userRepo.findById(ticket.getAssignedTo()).orElse(null)
            : null;

        List<AdminTicketNoteResponse> noteResponses = notes.stream()
            .map(n -> {
                User author = userRepo.findById(n.getAuthorId()).orElse(null);
                String authorName = author != null
                    ? (author.getFirstName() + " " + author.getLastName()).trim()
                    : "Unknown";
                return new AdminTicketNoteResponse(
                    n.getId(), n.getBody(), n.getIsInternal(), authorName, n.getCreatedAt()
                );
            })
            .collect(Collectors.toList());

        return new AdminTicketResponse(
            ticket.getId(),
            ticket.getTicketNumber(),
            ticket.getUserId(),
            customer != null ? customer.getEmail() : null,
            customer != null
                ? (customer.getFirstName() + " " + customer.getLastName()).trim()
                : null,
            ticket.getSubject(),
            ticket.getDescription(),
            ticket.getStatus().name(),
            ticket.getPriority().name(),
            ticket.getType() != null ? ticket.getType().name() : null,
            ticket.getAssignedTo(),
            assignee != null
                ? (assignee.getFirstName() + " " + assignee.getLastName()).trim()
                : null,
            ticket.getResolvedAt(),
            ticket.getCreatedAt(),
            ticket.getUpdatedAt(),
            noteResponses
        );
    }

    public AdminActivityResponse toActivityResponse(ActivityLog log) {
        return toActivityResponse(log, null, null);
    }

    public AdminActivityResponse toActivityResponse(ActivityLog log, User user, User actor) {
        return new AdminActivityResponse(
            log.getId(),
            log.getTenantId(),
            log.getUserId(),
            displayName(user),
            user != null ? user.getEmail() : null,
            log.getActorId(),
            displayName(actor),
            actor != null ? actor.getEmail() : null,
            log.getAction(),
            log.getEntityType(),
            log.getEntityId(),
            log.getMetadata(),
            log.getCreatedAt()
        );
    }

    private String displayName(User user) {
        if (user == null) return null;
        String name = ((user.getFirstName() != null ? user.getFirstName() : "") + " "
            + (user.getLastName() != null ? user.getLastName() : "")).trim();
        return !name.isBlank() ? name : user.getEmail();
    }

    private String activityCategory(ActivityLog log) {
        String action = log.getAction() != null ? log.getAction() : "";
        String entityType = log.getEntityType() != null ? log.getEntityType() : "";
        if (action.contains("LOGIN") || action.contains("LOGOUT") || action.contains("OTP")) return "AUTH";
        if (action.startsWith("EQUIPMENT_") || action.startsWith("SERVICE_RECORD_")
            || "EQUIPMENT".equals(entityType) || "SERVICE_RECORD".equals(entityType)
            || "EQUIPMENT_OPERATION".equals(entityType)) return "FLEET";
        if (action.startsWith("TICKET_") || "SUPPORT_TICKET".equals(entityType)) return "SUPPORT";
        if (action.contains("UPLOAD")) return "UPLOAD";
        if ("CONFIGURATOR_OPENED".equals(action)) return "CONFIGURATOR";
        if ("REPORT_DOWNLOADED".equals(action)) return "REPORT";
        if (action.startsWith("USER_") || action.startsWith("PLATFORM_")) return "ADMIN";
        return "SYSTEM";
    }
}
