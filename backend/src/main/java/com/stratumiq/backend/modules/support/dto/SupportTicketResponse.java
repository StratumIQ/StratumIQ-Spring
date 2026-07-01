package com.stratumiq.backend.modules.support.dto;

import com.stratumiq.backend.common.enums.SupportType;
import com.stratumiq.backend.common.enums.TicketPriority;
import com.stratumiq.backend.common.enums.TicketStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class SupportTicketResponse {

    private Long id;

    private String ticketNumber;

    private SupportType type;

    private String subject;

    private String description;

    private TicketStatus status;

    private TicketPriority priority;

    private Long assignedTo;

    private Instant createdAt;

    private Instant updatedAt;

    private Instant resolvedAt;

    private List<SupportTicketNoteResponse> notes;
}