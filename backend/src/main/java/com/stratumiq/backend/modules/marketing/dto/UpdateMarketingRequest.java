package com.stratumiq.backend.modules.marketing.dto;

import com.stratumiq.backend.common.enums.MarketingContentType;
import lombok.Data;

import java.time.Instant;

@Data
public class UpdateMarketingRequest {

    private MarketingContentType type;

    private String title;

    private String body;

    private String imageUrl;

    private String ctaUrl;

    private Boolean isActive;

    private Instant startsAt;

    private Instant endsAt;

    private Integer sortOrder;
}