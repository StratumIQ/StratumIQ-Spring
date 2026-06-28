package com.stratumiq.backend.modules.marketing.dto;

import com.stratumiq.backend.common.enums.MarketingContentStatus;
import com.stratumiq.backend.common.enums.MarketingContentType;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class MarketingResponse {

    private Long id;

    private MarketingContentType type;

    private String title;

    private String subtitle;

    private String body;

    private String richContent;

    private String imageUrl;

    private String thumbnailUrl;

    private String ctaText;

    private String ctaUrl;

    private Boolean isActive;

    private MarketingContentStatus status;

    private Boolean isPinned;

    private Integer priority;

    private String tags;

    private Instant startsAt;

    private Instant endsAt;

    private Integer sortOrder;

    private Long createdBy;

    private Long updatedBy;

    private Instant createdAt;

    private Instant updatedAt;
}
