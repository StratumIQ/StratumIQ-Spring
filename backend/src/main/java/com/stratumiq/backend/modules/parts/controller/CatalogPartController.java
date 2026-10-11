package com.stratumiq.backend.modules.parts.controller;

import com.stratumiq.backend.common.enums.PartStatus;
import com.stratumiq.backend.modules.parts.dto.CreatePartInquiryRequest;
import com.stratumiq.backend.modules.parts.dto.PartResponse;
import com.stratumiq.backend.modules.parts.service.PartService;
import com.stratumiq.backend.security.AuthenticatedUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/parts")
@Tag(name = "Parts Catalog", description = "Aftermarket parts marketplace")
public class CatalogPartController {

    private final PartService partService;

    public CatalogPartController(PartService partService) {
        this.partService = partService;
    }

    @GetMapping
    @Operation(summary = "Search catalog parts")
    public ResponseEntity<Map<String, Object>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) Long manufacturerId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) Boolean inStock,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit
    ) {
        return ResponseEntity.ok(partService.search(
                keyword, categoryId, brandId, manufacturerId, null,
                PartStatus.ACTIVE, featured, inStock, true,
                minPrice, maxPrice, sort, page, limit));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get catalog part")
    public ResponseEntity<PartResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(partService.getPublicPart(id));
    }

    @GetMapping("/{id}/related")
    @Operation(summary = "Related parts in the same category")
    public ResponseEntity<List<PartResponse>> related(@PathVariable Long id) {
        return ResponseEntity.ok(partService.getRelatedForCatalog(id));
    }

    @PostMapping("/{id}/inquiries")
    @Operation(summary = "Request a quote for a part")
    public ResponseEntity<Map<String, Object>> inquire(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody CreatePartInquiryRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(partService.createInquiry(id, user.userId(), user.tenantId(), request));
    }
}
