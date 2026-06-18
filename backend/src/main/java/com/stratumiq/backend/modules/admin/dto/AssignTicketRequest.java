package com.stratumiq.backend.modules.admin.dto;

import jakarta.validation.constraints.NotNull;

public record AssignTicketRequest(@NotNull Long assignedTo) {}
