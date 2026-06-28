package com.stratumiq.backend.modules.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request body for admin-initiated manual user creation.
 * Password is auto-generated as: LastName@CurrentYear1234
 * Username (login) is the email address.
 */
public record CreateUserRequest(
    @NotBlank @Size(max = 50) String firstName,
    @NotBlank @Size(max = 50) String lastName,
    @NotBlank @Email @Size(max = 255) String email,
    @Size(max = 20) String phone
) {}