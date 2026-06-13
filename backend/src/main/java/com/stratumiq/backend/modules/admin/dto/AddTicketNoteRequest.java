package com.stratumiq.backend.modules.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddTicketNoteRequest(
    @NotBlank @Size(max = 5000) String body,
    Boolean isInternal
) {}
