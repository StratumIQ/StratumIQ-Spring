package com.stratumiq.backend.modules.manufacturer.controller;

import com.stratumiq.backend.modules.manufacturer.dto.CreateManufacturerRequest;
import com.stratumiq.backend.modules.manufacturer.dto.ManufacturerResponse;
import com.stratumiq.backend.modules.manufacturer.dto.UpdateManufacturerRequest;
import com.stratumiq.backend.modules.manufacturer.service.ManufacturerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/manufacturers")
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
@Tag(name = "Manufacturers", description = "Manufacturer Management")
public class AdminManufacturerController {

    private final ManufacturerService service;

    public AdminManufacturerController(
            ManufacturerService service
    ) {
        this.service = service;
    }

    @PostMapping
    @Operation(summary = "Create Manufacturer")
    public ResponseEntity<ManufacturerResponse> create(
            @Valid @RequestBody CreateManufacturerRequest request
    ) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.create(request));
    }

    @GetMapping
    @Operation(summary = "Get All Manufacturers")
    public ResponseEntity<List<ManufacturerResponse>> getAll() {

        return ResponseEntity.ok(
                service.getAll()
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Manufacturer")
    public ResponseEntity<ManufacturerResponse> getById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                service.getById(id)
        );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Manufacturer")
    public ResponseEntity<ManufacturerResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateManufacturerRequest request
    ) {

        return ResponseEntity.ok(
                service.update(id, request)
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Archive Manufacturer")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {

        service.delete(id);

        return ResponseEntity.noContent().build();
    }

}