package com.stratumiq.backend.modules.dashboard;

import com.stratumiq.backend.modules.marketing.dto.MarketingResponse;
import com.stratumiq.backend.modules.marketing.service.MarketingService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardMarketingController {

    private final MarketingService marketingService;

    public DashboardMarketingController(
            MarketingService marketingService
    ) {
        this.marketingService = marketingService;
    }

    @GetMapping("/marketing")
    public List<MarketingResponse> getMarketingContent() {
        return marketingService.getDashboardMarketing();
    }
}