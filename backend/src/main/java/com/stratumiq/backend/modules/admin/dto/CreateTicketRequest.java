package com.stratumiq.backend.modules.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateTicketRequest(
    @NotNull Long userId,
    @NotBlank @Size(max = 200) String subject,
    @Size(max = 5000) String description,
    String priority
) {}
