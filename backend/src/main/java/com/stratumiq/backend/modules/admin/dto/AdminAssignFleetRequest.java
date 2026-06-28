package com.stratumiq.backend.modules.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request body for admin adding equipment to the platform fleet
 * and assigning ownership to a specific user.
 */
public record AdminAssignFleetRequest(
    @NotNull Long userId,
    @NotBlank @Size(max = 100) String name,
    @NotBlank @Size(max = 50) String serialNumber,
    @Size(max = 50) String make,
    @Size(max = 50) String model,
    @Size(max = 10) String year,
    String category,
    String status
) {}