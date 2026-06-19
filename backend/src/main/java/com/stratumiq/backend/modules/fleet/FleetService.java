package com.stratumiq.backend.modules.fleet;

import com.stratumiq.backend.common.enums.EquipmentStatus;
import com.stratumiq.backend.common.enums.MaintenanceStatus;
import com.stratumiq.backend.entity.*;
import com.stratumiq.backend.modules.fleet.dto.*;
import com.stratumiq.backend.repository.*;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.math.RoundingMode;

import java.time.Instant;
import java.util.*;

// Replaces fleet.service.js — all DB operations for fleet module
// Every query scoped by userId — no data leaks across accounts
@Service
public class FleetService {

    private final FleetEquipmentRepository    equipmentRepo;
    private final ServiceRecordRepository     serviceRecordRepo;
    private final EquipmentOperationRepository operationRepo;

    public FleetService(FleetEquipmentRepository equipmentRepo,
                        ServiceRecordRepository serviceRecordRepo,
                        EquipmentOperationRepository operationRepo) {
        this.equipmentRepo    = equipmentRepo;
        this.serviceRecordRepo = serviceRecordRepo;
        this.operationRepo    = operationRepo;
    }

    // ── EQUIPMENT CRUD ────────────────────────────────────────────────────

    // Replaces createEquipment() in fleet.service.js
    @Transactional
    public FleetEquipment createEquipment(Long userId, CreateEquipmentRequest req) {
        FleetEquipment eq = FleetEquipment.builder()
            .userId(userId)
            .name(req.name())
            .category(req.category())
            .serialNumber(req.serialNumber())
            .brand(req.brand())
            .model(req.model())
            .makeYear(req.makeYear())
            .status(req.status() != null ? req.status() : EquipmentStatus.ACTIVE)
            .runningHours(
    req.runningHours() != null
        ? req.runningHours()
        : BigDecimal.ZERO
)
            .location(req.location())
            .engineType(req.engineType())
            .powerOutput(req.powerOutput())
            .capacity(req.capacity())
            .application(req.application())
            .attachments(req.attachments())
            .imageUrl(req.imageUrl())
            .documentUrl(req.documentUrl())
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();
        return equipmentRepo.save(eq);
    }

    // Replaces listEquipment() — paginated + filtered
    public Map<String, Object> listEquipment(Long userId, String status,
                                              String category, String search,
                                              int page, int limit) {
        // Build pageable
        Pageable pageable = PageRequest.of(page - 1, limit,
            Sort.by(Sort.Direction.DESC, "createdAt"));

        // Use JPA Specifications for dynamic filtering
        var spec = FleetEquipmentSpec.filter(userId, status, category, search);
        Page<FleetEquipment> result = equipmentRepo.findAll(spec, pageable);

        return Map.of(
            "equipment",  result.getContent(),
            "pagination", Map.of(
                "page",       page,
                "limit",      limit,
                "total",      result.getTotalElements(),
                "totalPages", result.getTotalPages()
            )
        );
    }

    // Replaces findEquipmentById() — scoped by userId
    public FleetEquipment findById(Long id, Long userId) {
        return equipmentRepo.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Equipment not found"));
    }

    // Replaces updateEquipment() — partial update
    @Transactional
    public FleetEquipment updateEquipment(Long id, Long userId,
                                           UpdateEquipmentRequest req) {
        FleetEquipment eq = findById(id, userId);

        if (req.name()         != null) eq.setName(req.name());
        if (req.category()     != null) eq.setCategory(req.category());
        if (req.serialNumber() != null) eq.setSerialNumber(req.serialNumber());
        if (req.brand()        != null) eq.setBrand(req.brand());
        if (req.model()        != null) eq.setModel(req.model());
        if (req.makeYear()     != null) eq.setMakeYear(req.makeYear());
        if (req.status()       != null) eq.setStatus(req.status());
        if (req.runningHours() != null) eq.setRunningHours(req.runningHours());
        if (req.location()     != null) eq.setLocation(req.location());
        if (req.engineType()   != null) eq.setEngineType(req.engineType());
        if (req.powerOutput()  != null) eq.setPowerOutput(req.powerOutput());
        if (req.capacity()     != null) eq.setCapacity(req.capacity());
        if (req.application()  != null) eq.setApplication(req.application());
        if (req.attachments()  != null) eq.setAttachments(req.attachments());
        if (req.imageUrl()     != null) eq.setImageUrl(req.imageUrl());
        if (req.documentUrl()  != null) eq.setDocumentUrl(req.documentUrl());
        eq.setUpdatedAt(Instant.now());

        return equipmentRepo.save(eq);
    }

    // Replaces updateEquipment with { status } only
    @Transactional
    public FleetEquipment updateStatus(Long id, Long userId, String status) {
        FleetEquipment eq = findById(id, userId);
        eq.setStatus(EquipmentStatus.valueOf(status.toUpperCase()));
        eq.setUpdatedAt(Instant.now());
        return equipmentRepo.save(eq);
    }

    // Replaces deleteEquipment()
    @Transactional
    public void deleteEquipment(Long id, Long userId) {
        FleetEquipment eq = findById(id, userId);
        equipmentRepo.delete(eq);
    }

    // Replaces getFleetSummary() — aggregate counts
    public Map<String, Object> getFleetSummary(Long userId) {
        List<FleetEquipment> all = equipmentRepo.findAll(
            FleetEquipmentSpec.filter(userId, "all", "all", null),
            Pageable.unpaged()
        ).getContent();

        long total       = all.size();
        long active      = all.stream().filter(e -> e.getStatus() == EquipmentStatus.ACTIVE).count();
        long idle        = all.stream().filter(e -> e.getStatus() == EquipmentStatus.IDLE).count();
        long maintenance = all.stream().filter(e -> e.getStatus() == EquipmentStatus.MAINTENANCE).count();
        long retired     = all.stream().filter(e -> e.getStatus() == EquipmentStatus.RETIRED).count();
        BigDecimal avgHours = all.stream()
            .map(e -> e.getRunningHours() != null ? e.getRunningHours() : BigDecimal.ZERO)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        avgHours = all.isEmpty()
            ? BigDecimal.ZERO.setScale(1, RoundingMode.HALF_UP)
            : avgHours.divide(BigDecimal.valueOf(all.size()), 1, RoundingMode.HALF_UP);
        return Map.of(
            "total",              total,
            "active",             active,
            "idle",               idle,
            "maintenance",        maintenance,
            "retired",            retired,
            "avg_running_hours",  avgHours
        );
    }

    // ── SERVICE RECORDS ───────────────────────────────────────────────────

    // Replaces createServiceRecord()
    @Transactional
    public ServiceRecord createServiceRecord(Long equipmentId, Long userId,
                                              CreateServiceRecordRequest req) {
        findById(equipmentId, userId); // verify ownership

        ServiceRecord record = ServiceRecord.builder()
            .equipmentId(equipmentId)
            .userId(userId)
            .title(req.title())
            .serviceType(req.serviceType())
            .status(req.status() != null ? req.status() : MaintenanceStatus.SCHEDULED)
            .description(req.description())
            .technicianName(req.technicianName())
            .serviceDate(req.serviceDate())
            .hoursAtService(req.hoursAtService())
            .cost(req.cost())
            .partsUsed(req.partsUsed())
            .nextServiceDate(req.nextServiceDate())
            .nextServiceHours(req.nextServiceHours())
            .createdAt(Instant.now())
            .build();

        return serviceRecordRepo.save(record);
    }

    // Replaces listServiceRecords()
    public List<ServiceRecord> listServiceRecords(Long equipmentId, Long userId) {
        findById(equipmentId, userId); // verify ownership
        return serviceRecordRepo
            .findByEquipmentIdAndUserIdOrderByServiceDateDesc(equipmentId, userId);
    }

    // Replaces updateServiceRecord()
    @Transactional
    public ServiceRecord updateServiceRecord(Long recordId, Long equipmentId,
                                              Long userId, Object req) {
        return serviceRecordRepo
            .findByIdAndEquipmentIdAndUserId(recordId, equipmentId, userId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Service record not found"));
    }

    // Replaces deleteServiceRecord()
    @Transactional
    public void deleteServiceRecord(Long recordId, Long equipmentId, Long userId) {
        ServiceRecord record = serviceRecordRepo
            .findByIdAndEquipmentIdAndUserId(recordId, equipmentId, userId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Service record not found"));
        serviceRecordRepo.delete(record);
    }

    // ── OPERATIONS LOG ────────────────────────────────────────────────────

    // Replaces logOperation() — transactional hours update
    // Same logic as Node.js: lock row → compute delta → UPDATE → INSERT log
    @Transactional
    public EquipmentOperation logOperation(Long equipmentId, Long userId,
                                            LogOperationRequest req) {
        // Pessimistic lock — replaces SELECT ... FOR UPDATE in fleet.service.js
        FleetEquipment eq = equipmentRepo
            .findByIdAndUserIdForUpdate(equipmentId, userId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Equipment not found"));

        BigDecimal newTotal = eq.getRunningHours() != null
    ? eq.getRunningHours()
    : BigDecimal.ZERO;

        if ("hours_update".equals(req.eventType()) && req.hoursLogged() != null) {
         newTotal = newTotal.add(
    req.hoursLogged() != null
        ? req.hoursLogged()
        : BigDecimal.ZERO
);
            eq.setRunningHours(newTotal);
            eq.setUpdatedAt(Instant.now());
            equipmentRepo.save(eq);
        }

        EquipmentOperation op = EquipmentOperation.builder()
            .equipmentId(equipmentId)
            .userId(userId)
            .eventType(req.eventType())
            .hoursLogged(req.hoursLogged())
            .totalHoursSnapshot(newTotal)
            .downtimeReason(req.downtimeReason())
            .note(req.note())
            .loggedAt(Instant.now())
            .build();

        return operationRepo.save(op);
    }

    // Replaces listOperations()
    public List<EquipmentOperation> listOperations(Long equipmentId, Long userId) {
        findById(equipmentId, userId); // verify ownership
        return operationRepo
            .findTop50ByEquipmentIdAndUserIdOrderByLoggedAtDesc(equipmentId, userId);
    }
}