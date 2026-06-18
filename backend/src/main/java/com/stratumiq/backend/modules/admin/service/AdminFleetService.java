package com.stratumiq.backend.modules.admin.service;

import com.stratumiq.backend.entity.FleetEquipment;
import com.stratumiq.backend.entity.User;
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
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

@Service
public class AdminFleetService {

    private final FleetEquipmentRepository equipmentRepo;
    private final EquipmentOperationRepository operationRepo;
    private final UserRepository userRepo;
    private final AdminMapper mapper;

    public AdminFleetService(FleetEquipmentRepository equipmentRepo,
                             EquipmentOperationRepository operationRepo,
                             UserRepository userRepo,
                             AdminMapper mapper) {
        this.equipmentRepo = equipmentRepo;
        this.operationRepo = operationRepo;
        this.userRepo = userRepo;
        this.mapper = mapper;
    }

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

    public AdminEquipmentResponse getEquipment(AuthenticatedUser admin, Long id) {
        FleetEquipment eq = equipmentRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipment not found"));
        assertTenantAccess(admin, eq.getUserId());
        return mapper.toEquipmentResponse(eq);
    }

    public Map<String, Object> getHealth(AuthenticatedUser admin) {
        Long tenantId = AdminScope.tenantFilter(admin);
        var rows = equipmentRepo.countByStatus(tenantId);

        Map<String, Long> breakdown = new LinkedHashMap<>();
        long total = 0;
        for (Object[] row : rows) {
            String status = row[0].toString();
            long count = ((Number) row[1]).longValue();
            breakdown.put(status, count);
            total += count;
        }

        return Map.of(
            "totalEquipment", total,
            "statusBreakdown", breakdown,
            "maintenanceCount", breakdown.getOrDefault("MAINTENANCE", 0L)
        );
    }

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
