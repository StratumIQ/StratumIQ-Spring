package com.stratumiq.backend.modules.unitofmeasure.controller;

import com.stratumiq.backend.modules.unitofmeasure.dto.CreateUnitOfMeasureRequest;
import com.stratumiq.backend.modules.unitofmeasure.dto.UnitOfMeasureResponse;
import com.stratumiq.backend.modules.unitofmeasure.dto.UpdateUnitOfMeasureRequest;
import com.stratumiq.backend.modules.unitofmeasure.service.UnitOfMeasureService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/unit-of-measure")
@PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
@Tag(name = "Unit Of Measure", description = "Unit Of Measure Management")
public class AdminUnitOfMeasureController {

    private final UnitOfMeasureService service;

    public AdminUnitOfMeasureController(
            UnitOfMeasureService service
    ) {
        this.service = service;
    }

    @PostMapping
    @Operation(summary = "Create Unit Of Measure")
    public ResponseEntity<UnitOfMeasureResponse> create(
            @Valid @RequestBody CreateUnitOfMeasureRequest request
    ) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.create(request));
    }

    @GetMapping
    @Operation(summary = "Get All Units")
    public ResponseEntity<List<UnitOfMeasureResponse>> getAll() {

        return ResponseEntity.ok(
                service.getAll()
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Unit By Id")
    public ResponseEntity<UnitOfMeasureResponse> getById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                service.getById(id)
        );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Unit")
    public ResponseEntity<UnitOfMeasureResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUnitOfMeasureRequest request
    ) {

        return ResponseEntity.ok(
                service.update(id, request)
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Archive Unit")
    public ResponseEntity<Void> delete(
            @PathVariable Long id
    ) {

        service.delete(id);

        return ResponseEntity.noContent().build();
    }

}