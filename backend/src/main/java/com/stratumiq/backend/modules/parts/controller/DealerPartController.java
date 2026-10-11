package com.stratumiq.backend.modules.parts.controller;

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

import java.util.Map;

@RestController
@RequestMapping("/api/dealer/parts")
@PreAuthorize("hasRole('DEALER')")
@Tag(name = "Dealer Parts", description = "Dealer listing management")
public class DealerPartController {

    private final PartService partService;

    public DealerPartController(PartService partService) {
        this.partService = partService;
    }

    @PostMapping
    @Operation(summary = "Create a listing")
    public ResponseEntity<PartResponse> createPart(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody CreatePartRequest request
    ) {
        Long dealerId = partService.resolveListingOwner(user.userId(), false, null);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(partService.create(dealerId, user.userId(), request));
    }

    @GetMapping
    @Operation(summary = "List my listings")
    public ResponseEntity<Map<String, Object>> getMyParts(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) com.stratumiq.backend.common.enums.PartStatus status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit
    ) {
        return ResponseEntity.ok(partService.getDealerParts(user.userId(), keyword, status, page, limit));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get my listing")
    public ResponseEntity<PartResponse> getPartById(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        return ResponseEntity.ok(partService.getDealerPart(id, user.userId()));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update my listing")
    public ResponseEntity<PartResponse> updatePart(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody UpdatePartRequest request
    ) {
        return ResponseEntity.ok(partService.update(id, user.userId(), false, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Archive my listing")
    public ResponseEntity<Void> deletePart(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        partService.delete(id, user.userId(), false);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/images")
    @Operation(summary = "Add listing image")
    public ResponseEntity<PartResponse> addImage(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody PartImageRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(partService.addImage(id, user.userId(), false, request));
    }

    @DeleteMapping("/{id}/images/{imageId}")
    @Operation(summary = "Remove listing image")
    public ResponseEntity<Void> removeImage(
            @PathVariable Long id,
            @PathVariable Long imageId,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        partService.removeImage(id, imageId, user.userId(), false);
        return ResponseEntity.noContent().build();
    }
}
