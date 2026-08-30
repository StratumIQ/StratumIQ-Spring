package com.stratumiq.backend.modules.partbrand.controller;

import com.stratumiq.backend.modules.partbrand.dto.CreatePartBrandRequest;
import com.stratumiq.backend.modules.partbrand.dto.PartBrandResponse;
import com.stratumiq.backend.modules.partbrand.dto.UpdatePartBrandRequest;
import com.stratumiq.backend.modules.partbrand.service.PartBrandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/part-brands")
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
@Tag(name = "Part Brands", description = "Part Brand Management")
public class AdminPartBrandController {

    private final PartBrandService service;

    public AdminPartBrandController(PartBrandService service) {
        this.service = service;
    }

    @PostMapping
    @Operation(summary = "Create Part Brand")
    public ResponseEntity<PartBrandResponse> create(
            @Valid @RequestBody CreatePartBrandRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.create(request));
    }

    @GetMapping
    @Operation(summary = "Get All Brands")
    public ResponseEntity<List<PartBrandResponse>> getAll() {

        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Brand By Id")
    public ResponseEntity<PartBrandResponse> getById(
            @PathVariable Long id) {

        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Brand")
    public ResponseEntity<PartBrandResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePartBrandRequest request) {

        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Archive Brand")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {

        service.delete(id);

        return ResponseEntity.noContent().build();
    }
}