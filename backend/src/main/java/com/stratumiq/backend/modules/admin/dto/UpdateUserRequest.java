package com.stratumiq.backend.modules.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
    @Size(max = 50) String firstName,
    @Size(max = 50) String lastName,
    @Email @Size(max = 255) String email,
    @Size(max = 20) String phone
) {}
