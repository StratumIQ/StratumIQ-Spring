package com.stratumiq.backend.modules.partcategory.controller;

import com.stratumiq.backend.modules.partcategory.dto.CreatePartCategoryRequest;
import com.stratumiq.backend.modules.partcategory.dto.PartCategoryResponse;
import com.stratumiq.backend.modules.partcategory.dto.UpdatePartCategoryRequest;
import com.stratumiq.backend.modules.partcategory.service.PartCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/part-categories")
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
@Tag(name = "Part Categories", description = "Part Category Management")
public class AdminPartCategoryController {

    private final PartCategoryService service;

    public AdminPartCategoryController(
            PartCategoryService service
    ) {
        this.service = service;
    }

    @PostMapping
    @Operation(summary = "Create Part Category")
    public ResponseEntity<PartCategoryResponse> create(
            @Valid @RequestBody CreatePartCategoryRequest request
    ) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.create(request));
    }

    @GetMapping
    @Operation(summary = "Get All Categories")
    public ResponseEntity<List<PartCategoryResponse>> getAll() {

        return ResponseEntity.ok(
                service.getAll()
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Category By Id")
    public ResponseEntity<PartCategoryResponse> getById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                service.getById(id)
        );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Category")
    public ResponseEntity<PartCategoryResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePartCategoryRequest request
    ) {

        return ResponseEntity.ok(
                service.update(id, request)
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Archive Category")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {

        service.delete(id);

        return ResponseEntity.noContent().build();
    }

}