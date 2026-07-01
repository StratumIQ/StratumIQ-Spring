package com.stratumiq.backend.modules.support.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateSupportTicketNoteRequest {

    @NotBlank(message = "Reply is required")
    @Size(max = 4000, message = "Reply must be at most 4000 characters")
    private String body;
}
