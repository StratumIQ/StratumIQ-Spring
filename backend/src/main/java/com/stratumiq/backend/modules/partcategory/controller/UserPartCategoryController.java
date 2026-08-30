package com.stratumiq.backend.modules.partcategory.controller;

import com.stratumiq.backend.modules.partcategory.dto.PartCategoryResponse;
import com.stratumiq.backend.modules.partcategory.service.PartCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/part-categories")
@Tag(name = "Part Categories", description = "Public Part Category APIs")
public class UserPartCategoryController {

    private final PartCategoryService service;

    public UserPartCategoryController(
            PartCategoryService service
    ) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Get Active Part Categories")
    public ResponseEntity<List<PartCategoryResponse>> getActiveCategories() {

        return ResponseEntity.ok(
                service.getActive()
        );
    }
}