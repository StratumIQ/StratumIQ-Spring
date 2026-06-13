package com.stratumiq.backend.modules.admin.response;

import java.time.Instant;
import java.util.List;

public record AdminTicketResponse(
    Long id,
    String ticketNumber,
    Long userId,
    String customerEmail,
    String customerName,
    String subject,
    String description,
    String status,
    String priority,
    Long assignedTo,
    String assigneeName,
    Instant resolvedAt,
    Instant createdAt,
    Instant updatedAt,
    List<AdminTicketNoteResponse> notes
) {}
