package com.stratumiq.backend.modules.marketing.dto;

import com.stratumiq.backend.common.enums.MarketingContentStatus;
import lombok.Data;

@Data
public class UpdateMarketingStatusRequest {

    private Boolean isActive;

    private MarketingContentStatus status;

    private Boolean isPinned;
}
