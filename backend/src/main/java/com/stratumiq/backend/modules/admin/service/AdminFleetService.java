package com.stratumiq.backend.modules.admin.service;

import com.stratumiq.backend.common.enums.EquipmentCategory;
import com.stratumiq.backend.common.enums.EquipmentStatus;
import com.stratumiq.backend.entity.FleetEquipment;
import com.stratumiq.backend.entity.User;
import com.stratumiq.backend.modules.admin.dto.AdminAssignFleetRequest;
import com.stratumiq.backend.modules.admin.mapper.AdminMapper;
import com.stratumiq.backend.modules.admin.response.AdminEquipmentResponse;
import com.stratumiq.backend.modules.admin.specification.AdminSpecifications;
import com.stratumiq.backend.repository.EquipmentOperationRepository;
import com.stratumiq.backend.repository.FleetEquipmentRepository;
import com.stratumiq.backend.repository.UserRepository;
import com.stratumiq.backend.security.AuthenticatedUser;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@Service
public class AdminFleetService {

    private final FleetEquipmentRepository equipmentRepo;
    private final EquipmentOperationRepository operationRepo;
    private final UserRepository userRepo;
    private final AdminMapper mapper;
    private final AdminActivityLogger activityLogger;

    public AdminFleetService(FleetEquipmentRepository equipmentRepo,
                             EquipmentOperationRepository operationRepo,
                             UserRepository userRepo,
                             AdminMapper mapper,
                             AdminActivityLogger activityLogger) {
        this.equipmentRepo = equipmentRepo;
        this.operationRepo = operationRepo;
        this.userRepo = userRepo;
        this.mapper = mapper;
        this.activityLogger = activityLogger;
    }

    // ─── List ─────────────────────────────────────────────────────────────────

    public Map<String, Object> listEquipment(AuthenticatedUser admin,
            String status, String search, Long userId, int page, int limit) {
        Long tenantId = AdminScope.tenantFilter(admin);
        Pageable pageable = PageRequest.of(page - 1, limit,
            Sort.by(Sort.Direction.DESC, "createdAt"));

        var spec = AdminSpecifications.equipment(tenantId, status, search, userId);
        Page<FleetEquipment> result = equipmentRepo.findAll(spec, pageable);

        List<AdminEquipmentResponse> items = result.getContent().stream()
            .map(mapper::toEquipmentResponse)
            .toList();

        return Map.of(
            "equipment", items,
            "pagination", Map.of(
                "page", page,
                "limit", limit,
                "total", result.getTotalElements(),
                "totalPages", result.getTotalPages()
            )
        );
    }

    // ─── Get single ───────────────────────────────────────────────────────────

    public AdminEquipmentResponse getEquipment(AuthenticatedUser admin, Long id) {
        FleetEquipment eq = equipmentRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipment not found"));
        assertTenantAccess(admin, eq.getUserId());
        return mapper.toEquipmentResponse(eq);
    }

    // ─── Admin adds equipment and assigns to a user ───────────────────────────

    /**
     * Admin creates a new piece of equipment and assigns it directly to a user.
     * Once saved, the equipment immediately appears in the user's fleet dashboard.
     *
     * Flow:
     *  1. Validate the target user exists and is within the admin's tenant scope.
     *  2. Build a FleetEquipment record with userId = target user's id.
     *  3. Save and log the activity.
     *  4. Return the new equipment record.
     */
    @Transactional
    public AdminEquipmentResponse adminAddEquipment(AuthenticatedUser admin, AdminAssignFleetRequest req) {
        // Validate target user
        User targetUser = userRepo.findById(req.userId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Target user not found"));

        if (targetUser.getDeletedAt() != null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Target user not found");
        }

        // Tenant scope check
        Long tenantId = AdminScope.tenantFilter(admin);
        if (tenantId != null && !tenantId.equals(targetUser.getTenantId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "Cannot assign equipment to a user outside your tenant scope.");
        }

        // Parse category — default to null if not provided or unrecognised
        EquipmentCategory category = null;
        if (req.category() != null && !req.category().isBlank()) {
            try {
                category = EquipmentCategory.valueOf(req.category().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid equipment category: " + req.category());
            }
        }

        // Parse status — default to ACTIVE
        EquipmentStatus status = EquipmentStatus.ACTIVE;
        if (req.status() != null && !req.status().isBlank()) {
            try {
                status = EquipmentStatus.valueOf(req.status().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid equipment status: " + req.status());
            }
        }

        Integer makeYear = null;
        if (req.year() != null && !req.year().isBlank()) {
            try {
                makeYear = Integer.parseInt(req.year().trim());
            } catch (NumberFormatException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Invalid make year: " + req.year());
            }
        }

        FleetEquipment equipment = FleetEquipment.builder()
            .userId(targetUser.getId())
            .name(req.name().trim())
            .serialNumber(req.serialNumber().trim())
            .brand(req.make() != null ? req.make().trim() : null)
            .model(req.model() != null ? req.model().trim() : null)
            .makeYear(makeYear)
            .category(category)
            .status(status)
            .build();

        equipment = equipmentRepo.save(equipment);

        activityLogger.log(
            targetUser.getTenantId(),
            targetUser.getId(),
            admin.userId(),
            "EQUIPMENT_ADDED",
            "EQUIPMENT",
            equipment.getId(),
            Map.of(
                "equipmentName", equipment.getName(),
                "assignedToUserId", targetUser.getId(),
                "assignedToEmail", targetUser.getEmail(),
                "addedByAdmin", admin.userId()
            )
        );

        return mapper.toEquipmentResponse(equipment);
    }

    // ─── Health summary ───────────────────────────────────────────────────────

    public Map<String, Object> getHealth(AuthenticatedUser admin) {
        Long tenantId = AdminScope.tenantFilter(admin);
        var rows = equipmentRepo.countByStatus(tenantId);

        Map<String, Long> breakdown = new LinkedHashMap<>();
        long total = 0;
        for (Object[] row : rows) {
            String s = row[0].toString();
            long count = ((Number) row[1]).longValue();
            breakdown.put(s, count);
            total += count;
        }

        return Map.of(
            "totalEquipment", total,
            "statusBreakdown", breakdown,
            "maintenanceCount", breakdown.getOrDefault("MAINTENANCE", 0L)
        );
    }

    // ─── Recent activity ──────────────────────────────────────────────────────

    public Map<String, Object> getActivity(AuthenticatedUser admin, int limit) {
        Long tenantId = AdminScope.tenantFilter(admin);
        var ops = operationRepo.findRecentOperations(tenantId, PageRequest.of(0, limit));

        List<Map<String, Object>> items = ops.stream()
            .map(op -> {
                User owner = userRepo.findById(op.getUserId()).orElse(null);
                FleetEquipment eq = equipmentRepo.findById(op.getEquipmentId()).orElse(null);
                return Map.<String, Object>of(
                    "id", op.getId(),
                    "equipmentId", op.getEquipmentId(),
                    "equipmentName", eq != null ? eq.getName() : "",
                    "userId", op.getUserId(),
                    "ownerEmail", owner != null ? owner.getEmail() : "",
                    "eventType", op.getEventType(),
                    "hoursLogged", op.getHoursLogged() != null ? op.getHoursLogged() : 0,
                    "note", op.getNote() != null ? op.getNote() : "",
                    "loggedAt", op.getLoggedAt().toString()
                );
            })
            .toList();

        return Map.of("activity", items);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private void assertTenantAccess(AuthenticatedUser admin, Long ownerUserId) {
        Long tenantId = AdminScope.tenantFilter(admin);
        if (tenantId == null) return;

        User owner = userRepo.findById(ownerUserId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipment not found"));

        if (!tenantId.equals(owner.getTenantId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
    }
}