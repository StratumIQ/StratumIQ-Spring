package com.stratumiq.backend.modules.admin.response;

import java.time.Instant;

public record AdminTicketNoteResponse(
    Long id,
    String body,
    Boolean isInternal,
    String authorName,
    Instant createdAt
) {}
