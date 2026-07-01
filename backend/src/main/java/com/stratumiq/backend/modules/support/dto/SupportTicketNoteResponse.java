package com.stratumiq.backend.modules.support.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class SupportTicketNoteResponse {
    private Long id;
    private String body;
    private boolean internal;
    private Instant createdAt;
}
