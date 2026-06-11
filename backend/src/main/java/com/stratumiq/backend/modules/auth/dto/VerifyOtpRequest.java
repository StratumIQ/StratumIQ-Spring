package com.stratumiq.backend.modules.auth.dto;

import jakarta.validation.constraints.*;

// Replaces verifyEmailSchema + verifyPhoneSchema from auth.validation.js
public record VerifyOtpRequest(

    @NotNull(message = "userId is required")
    Long userId,

    @NotBlank(message = "OTP is required")
    @Size(min = 6, max = 6, message = "OTP must be exactly 6 digits")
    String otp

) {}