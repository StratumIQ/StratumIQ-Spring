package com.stratumiq.backend.modules.support.dto;

import com.stratumiq.backend.common.enums.SupportType;
import com.stratumiq.backend.common.enums.TicketPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateSupportTicketRequest {

   @NotNull(message = "Support type is required")
private SupportType type;

    @NotBlank(message = "Subject is required")
    @Size(max = 200)
    private String subject;

    @NotBlank(message = "Description is required")
    @Size(max = 5000)
    private String description;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;
}