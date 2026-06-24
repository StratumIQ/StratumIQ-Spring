package com.stratumiq.backend.modules.marketing.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateMarketingStatusRequest {

    @NotNull
    private Boolean isActive;
}