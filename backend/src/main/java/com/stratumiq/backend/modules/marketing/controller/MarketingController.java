package com.stratumiq.backend.modules.marketing.controller;

import com.stratumiq.backend.modules.marketing.dto.*;
import com.stratumiq.backend.modules.marketing.service.MarketingService;
import com.stratumiq.backend.security.AuthenticatedUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/marketing")
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
@Tag(name = "Admin Marketing", description = "Marketing news and announcements management")
public class MarketingController {

    private final MarketingService marketingService;

    public MarketingController(MarketingService marketingService) {
        this.marketingService = marketingService;
    }

    @PostMapping
    @Operation(summary = "Create marketing content")
    public MarketingResponse create(
            @AuthenticationPrincipal AuthenticatedUser admin,
            @Valid @RequestBody CreateMarketingRequest request
    ) {
        return marketingService.create(request, admin);
    }

    @GetMapping
    @Operation(summary = "List marketing content with search, filters, and pagination")
    public Map<String, Object> list(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "all") String status,
            @RequestParam(defaultValue = "all") String type,
            @RequestParam(required = false) Boolean pinned,
            @RequestParam(defaultValue = "false") boolean includeArchived,
            @RequestParam(defaultValue = "sortOrder") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit
    ) {
        return marketingService.list(search, status, type, pinned, includeArchived,
            sortBy, sortDir, page, limit);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get marketing content by ID")
    public MarketingResponse getById(@PathVariable Long id) {
        return marketingService.getById(id);
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Preview top dashboard marketing items")
    public List<MarketingResponse> getDashboardMarketing() {
        return marketingService.getDashboardMarketing();
    }

    @GetMapping("/kpis")
    @Operation(summary = "Get marketing KPI summary")
    public MarketingKpiResponse getKpis() {
        return marketingService.getKpis();
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update marketing content")
    public MarketingResponse update(
            @AuthenticationPrincipal AuthenticatedUser admin,
            @PathVariable Long id,
            @Valid @RequestBody UpdateMarketingRequest request
    ) {
        return marketingService.update(id, request, admin);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update marketing status or pinned flag")
    public MarketingResponse updateStatus(
            @AuthenticationPrincipal AuthenticatedUser admin,
            @PathVariable Long id,
            @Valid @RequestBody UpdateMarketingStatusRequest request
    ) {
        return marketingService.updateStatus(id, request, admin);
    }

    @PostMapping("/{id}/archive")
    @Operation(summary = "Archive marketing content")
    public MarketingResponse archive(
            @AuthenticationPrincipal AuthenticatedUser admin,
            @PathVariable Long id
    ) {
        return marketingService.archive(id, admin);
    }

    @PostMapping("/{id}/restore")
    @Operation(summary = "Restore archived or deleted marketing content")
    public MarketingResponse restore(
            @AuthenticationPrincipal AuthenticatedUser admin,
            @PathVariable Long id
    ) {
        return marketingService.restore(id, admin);
    }

    @PostMapping("/{id}/duplicate")
    @Operation(summary = "Duplicate marketing content as draft")
    public MarketingResponse duplicate(
            @AuthenticationPrincipal AuthenticatedUser admin,
            @PathVariable Long id
    ) {
        return marketingService.duplicate(id, admin);
    }

    @PostMapping("/bulk")
    @Operation(summary = "Bulk publish, unpublish, archive, or delete")
    public Map<String, Object> bulkAction(
            @AuthenticationPrincipal AuthenticatedUser admin,
            @Valid @RequestBody BulkMarketingRequest request
    ) {
        return marketingService.bulkAction(request, admin);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft-delete marketing content")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal AuthenticatedUser admin,
            @PathVariable Long id
    ) {
        marketingService.delete(id, admin);
        return ResponseEntity.noContent().build();
    }
}
