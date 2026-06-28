package com.stratumiq.backend.modules.dashboard;

import com.stratumiq.backend.modules.marketing.dto.MarketingResponse;
import com.stratumiq.backend.modules.marketing.service.MarketingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard Marketing", description = "User-facing marketing news")
public class DashboardMarketingController {

    private final MarketingService marketingService;

    public DashboardMarketingController(MarketingService marketingService) {
        this.marketingService = marketingService;
    }

    @GetMapping("/marketing")
    @Operation(summary = "Top 5 featured marketing news for dashboard slider")
    public List<MarketingResponse> getMarketingContent() {
        return marketingService.getDashboardMarketing();
    }

    @GetMapping("/marketing/all")
    @Operation(summary = "All published marketing news with pagination")
    public Map<String, Object> getAllMarketing(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int limit
    ) {
        return marketingService.getAllPublishedMarketing(page, limit);
    }
}
