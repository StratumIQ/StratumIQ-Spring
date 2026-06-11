package com.stratumiq.backend.modules.auth.dto;

import jakarta.validation.constraints.*;

// Replaces loginSchema from auth.validation.js
public record LoginRequest(

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    String email,

    @NotBlank(message = "Password is required")
    String password

) {}