package com.stratumiq.backend.modules.auth.dto;

import jakarta.validation.constraints.*;

public record SendPhoneOtpRequest(

    @NotNull(message = "userId is required")
    Long userId,

    @NotBlank(message = "Phone is required")
    String phone

) {}