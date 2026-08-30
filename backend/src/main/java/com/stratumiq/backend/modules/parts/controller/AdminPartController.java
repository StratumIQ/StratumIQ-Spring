package com.stratumiq.backend.modules.parts.controller;

import com.stratumiq.backend.common.enums.PartStatus;
import com.stratumiq.backend.modules.parts.dto.CreatePartRequest;
import com.stratumiq.backend.modules.parts.dto.PartImageRequest;
import com.stratumiq.backend.modules.parts.dto.PartResponse;
import com.stratumiq.backend.modules.parts.dto.UpdatePartRequest;
import com.stratumiq.backend.modules.parts.service.PartService;
import com.stratumiq.backend.security.AuthenticatedUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/parts")
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
@Tag(name = "Admin Parts", description = "Admin marketplace listings")
public class AdminPartController {

    private final PartService partService;

    public AdminPartController(PartService partService) {
        this.partService = partService;
    }

    @GetMapping
    @Operation(summary = "Search all listings")
    public ResponseEntity<Map<String, Object>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) Long manufacturerId,
            @RequestParam(required = false) Long dealerId,
            @RequestParam(required = false) PartStatus status,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) Boolean inStock,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit
    ) {
        return ResponseEntity.ok(partService.search(
                keyword, categoryId, brandId, manufacturerId, dealerId,
                status, featured, inStock, false,
                minPrice, maxPrice, sort, page, limit));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get any listing")
    public ResponseEntity<PartResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(partService.getManagedPart(id));
    }

    @PostMapping
    @Operation(summary = "Create listing for a dealer")
    public ResponseEntity<PartResponse> create(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody CreatePartRequest request
    ) {
        Long dealerId = partService.resolveListingOwner(user.userId(), true, request.getDealerId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(partService.create(dealerId, user.userId(), request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update any listing")
    public ResponseEntity<PartResponse> update(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody UpdatePartRequest request
    ) {
        return ResponseEntity.ok(partService.update(id, user.userId(), true, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Archive any listing")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        partService.delete(id, user.userId(), true);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/images")
    public ResponseEntity<PartResponse> addImage(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody PartImageRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(partService.addImage(id, user.userId(), true, request));
    }

    @DeleteMapping("/{id}/images/{imageId}")
    public ResponseEntity<Void> removeImage(
            @PathVariable Long id,
            @PathVariable Long imageId,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        partService.removeImage(id, imageId, user.userId(), true);
        return ResponseEntity.noContent().build();
    }
}
