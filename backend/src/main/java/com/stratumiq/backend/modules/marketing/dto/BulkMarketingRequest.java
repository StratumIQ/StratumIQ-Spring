package com.stratumiq.backend.modules.marketing.dto;

import com.stratumiq.backend.common.enums.BulkMarketingAction;
import com.stratumiq.backend.common.enums.MarketingContentType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class BulkMarketingRequest {

    @NotEmpty
    private List<Long> ids;

    @NotNull
    private BulkMarketingAction action;
}
