package com.stratumiq.backend.modules.marketing.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MarketingKpiResponse {
    private long totalNews;
    private long published;
    private long drafts;
    private long archived;
    private long pinned;
    private long scheduled;
    private long expired;
    private long totalViews;
    private long totalClicks;
    private double ctr;
}
