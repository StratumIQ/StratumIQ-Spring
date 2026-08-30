package com.stratumiq.backend.modules.partbrand.controller;

import com.stratumiq.backend.modules.partbrand.dto.PartBrandResponse;
import com.stratumiq.backend.modules.partbrand.service.PartBrandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/part-brands")
@Tag(name = "Part Brands", description = "Public Part Brand APIs")
public class UserPartBrandController {

    private final PartBrandService service;

    public UserPartBrandController(PartBrandService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Get Active Part Brands")
    public ResponseEntity<List<PartBrandResponse>> getActiveBrands() {

        return ResponseEntity.ok(
                service.getActive()
        );
    }
}