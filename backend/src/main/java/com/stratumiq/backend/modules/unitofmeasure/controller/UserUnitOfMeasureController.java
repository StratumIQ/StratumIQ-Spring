package com.stratumiq.backend.modules.unitofmeasure.controller;

import com.stratumiq.backend.modules.unitofmeasure.dto.UnitOfMeasureResponse;
import com.stratumiq.backend.modules.unitofmeasure.service.UnitOfMeasureService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/unit-of-measure")
@Tag(name = "Unit Of Measure", description = "Public Unit Of Measure APIs")
public class UserUnitOfMeasureController {

    private final UnitOfMeasureService service;

    public UserUnitOfMeasureController(
            UnitOfMeasureService service
    ) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Get Active Units Of Measure")
    public ResponseEntity<List<UnitOfMeasureResponse>> getActiveUnits() {

        return ResponseEntity.ok(
                service.getActive()
        );
    }

}