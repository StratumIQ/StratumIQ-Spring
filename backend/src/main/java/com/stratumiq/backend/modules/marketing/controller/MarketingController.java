package com.stratumiq.backend.modules.marketing.controller;

import com.stratumiq.backend.modules.marketing.dto.CreateMarketingRequest;
import com.stratumiq.backend.modules.marketing.dto.MarketingResponse;
import com.stratumiq.backend.modules.marketing.service.MarketingService;
import com.stratumiq.backend.modules.marketing.dto.UpdateMarketingRequest;
import com.stratumiq.backend.modules.marketing.dto.UpdateMarketingStatusRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/admin/marketing")
public class MarketingController {

    private final MarketingService marketingService;

    public MarketingController(MarketingService marketingService) {
        this.marketingService = marketingService;
    }

    @PostMapping
    public MarketingResponse create(
            @Valid @RequestBody CreateMarketingRequest request
    ) {
        return marketingService.create(request);
    }

    @GetMapping
    public Map<String, Object> listAll() {
        return marketingService.listAll();
    }

    @GetMapping("/{id}")
    public MarketingResponse getById(
            @PathVariable Long id
    ) {
        return marketingService.getById(id);
    }

    @GetMapping("/dashboard")
public List<MarketingResponse> getDashboardMarketing() {
    return marketingService.getDashboardMarketing();
}

    @PutMapping("/{id}")
public MarketingResponse update(
        @PathVariable Long id,
        @Valid @RequestBody UpdateMarketingRequest request
) {
    return marketingService.update(id, request);
}


@PatchMapping("/{id}/status")
public MarketingResponse updateStatus(
        @PathVariable Long id,
        @Valid @RequestBody UpdateMarketingStatusRequest request
) {
    return marketingService.updateStatus(id, request);
}
    @DeleteMapping("/{id}")
    public void delete(
            @PathVariable Long id
    ) {
        marketingService.delete(id);
    }
}