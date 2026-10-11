package com.stratumiq.backend.modules.manufacturer.controller;

import com.stratumiq.backend.modules.manufacturer.dto.ManufacturerResponse;
import com.stratumiq.backend.modules.manufacturer.service.ManufacturerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manufacturers")
@Tag(name = "Manufacturers", description = "Public Manufacturer APIs")
public class UserManufacturerController {

    private final ManufacturerService service;

    public UserManufacturerController(
            ManufacturerService service
    ) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Get Active Manufacturers")
    public ResponseEntity<List<ManufacturerResponse>> getActiveManufacturers() {

        return ResponseEntity.ok(
                service.getActive()
        );
    }

}