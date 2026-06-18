package com.stratumiq.backend.modules.admin.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateUserStatusRequest(@NotBlank String status) {}
