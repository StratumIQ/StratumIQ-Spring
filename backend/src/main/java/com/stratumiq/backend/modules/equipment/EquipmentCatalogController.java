package com.stratumiq.backend.modules.equipment;

import com.stratumiq.backend.modules.equipment.dto.CreateEquipmentCatalogRequest;
import com.stratumiq.backend.modules.equipment.dto.EquipmentOemRequest;
import com.stratumiq.backend.modules.equipment.dto.UpdateEquipmentCatalogRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@Validated
@RequestMapping("/api/equipment")
public class EquipmentCatalogController {

    private final EquipmentCatalogService service;

    public EquipmentCatalogController(EquipmentCatalogService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('PERM_equipment:view')")
    public ResponseEntity<?> list(
            @RequestParam(required = false) String brand,
            @RequestParam(name = "equipment_type", required = false) String equipmentType,
            @RequestParam(name = "mobility_type", required = false) String mobilityType,
            @RequestParam(name = "oem_id", required = false) @Min(1) Long oemId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "1") @Min(1) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        return ResponseEntity.ok(service.list(brand, equipmentType, mobilityType, oemId, search, page, limit));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<?> create(@Valid @RequestBody CreateEquipmentCatalogRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(request));
    }

    @GetMapping("/{equipmentId}")
    @PreAuthorize("hasAuthority('PERM_equipment:view')")
    public ResponseEntity<?> get(@PathVariable String equipmentId) {
        return ResponseEntity.ok(service.get(equipmentId));
    }

    @PatchMapping("/{equipmentId}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<?> update(@PathVariable String equipmentId,
                                    @Valid @RequestBody UpdateEquipmentCatalogRequest request) {
        return ResponseEntity.ok(service.update(equipmentId, request));
    }

    @PatchMapping("/{equipmentId}/status")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<?> updateStatus(@PathVariable String equipmentId,
                                          @RequestBody StatusRequest request) {
        return ResponseEntity.ok(service.updateStatus(equipmentId,
            request == null ? null : request.status()));
    }

    @GetMapping("/oems")
    @PreAuthorize("hasAuthority('PERM_equipment:view')")
    public ResponseEntity<?> listOems() {
        return ResponseEntity.ok(java.util.Map.of("oems", service.listOems()));
    }

    @GetMapping("/oems/{id}")
    @PreAuthorize("hasAuthority('PERM_equipment:view')")
    public ResponseEntity<?> getOem(@PathVariable Long id) {
        return ResponseEntity.ok(java.util.Map.of("oem", service.getOem(id)));
    }

    @PostMapping("/oems")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<?> createOem(@Valid @RequestBody EquipmentOemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(java.util.Map.of("oem", service.createOem(request)));
    }

    @PatchMapping("/oems/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<?> updateOem(@PathVariable Long id,
                                       @Valid @RequestBody EquipmentOemRequest request) {
        return ResponseEntity.ok(java.util.Map.of("oem", service.updateOem(id, request)));
    }

    public record StatusRequest(String status) {}
}