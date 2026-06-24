package com.stratumiq.backend.modules.marketing.dto;

import com.stratumiq.backend.common.enums.MarketingContentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;

@Data
public class CreateMarketingRequest {

    @NotNull
    private MarketingContentType type;

    @NotBlank
    private String title;

    private String body;

    private String imageUrl;

    private String ctaUrl;

    private Boolean isActive;

    private Instant startsAt;

    private Instant endsAt;

    private Integer sortOrder;
}