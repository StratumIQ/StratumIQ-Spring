package com.stratumiq.backend.modules.dashboard;

import com.stratumiq.backend.common.enums.EquipmentStatus;
import com.stratumiq.backend.entity.*;
import com.stratumiq.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

// Replaces dashboard.service.js
@Service
public class DashboardService {

    private final UserRepository      userRepo;
    private final FleetEquipmentRepository equipmentRepo;

    public DashboardService(UserRepository userRepo,
                            FleetEquipmentRepository equipmentRepo) {
        this.userRepo      = userRepo;
        this.equipmentRepo = equipmentRepo;
    }

    // GET /api/dashboard/stats — replaces getDashboardStats()
    public Map<String, Object> getDashboardStats(Long userId) {
        var all = equipmentRepo.findAll(
            com.stratumiq.backend.modules.fleet.FleetEquipmentSpec
                .filter(userId, "all", "all", null),
            org.springframework.data.domain.Pageable.unpaged()
        ).getContent();

        long total       = all.size();
        long active      = all.stream().filter(e -> e.getStatus() == EquipmentStatus.ACTIVE).count();
        long maintenance = all.stream().filter(e -> e.getStatus() == EquipmentStatus.MAINTENANCE).count();
        long idle        = all.stream().filter(e -> e.getStatus() == EquipmentStatus.IDLE).count();

        return Map.of(
            "totalEquipment",       total,
            "activeEquipment",      active,
            "maintenanceEquipment", maintenance,
            "idleEquipment",        idle
        );
    }

    // GET /api/dashboard/profile — replaces getUserProfile()
    public Map<String, Object> getUserProfile(Long userId) {
        User user = userRepo.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "User not found"));

        return Map.of(
            "id",        user.getId(),
            "firstName", user.getFirstName() != null ? user.getFirstName() : "",
            "lastName",  user.getLastName()  != null ? user.getLastName()  : "",
            "email",     user.getEmail(),
            "phone",     user.getPhone()     != null ? user.getPhone()     : "",
            "role",      user.getRole().name(),
            "status",    user.getAccountStatus().name()
        );
    }

    // GET /api/dashboard/activity — replaces getRecentActivity()
    public Map<String, Object> getRecentActivity(Long userId) {
        // Returns last 10 equipment as recent activity (expand later)
        var recent = equipmentRepo.findAll(
            com.stratumiq.backend.modules.fleet.FleetEquipmentSpec
                .filter(userId, "all", "all", null),
            org.springframework.data.domain.PageRequest.of(0, 10,
                org.springframework.data.domain.Sort.by(
                    org.springframework.data.domain.Sort.Direction.DESC, "createdAt"))
        ).getContent();

        return Map.of("activity", recent);
    }

    // GET /api/dashboard/fleet — replaces getFleet()
    public Map<String, Object> getFleet(Long userId) {
        var fleet = equipmentRepo.findAll(
            com.stratumiq.backend.modules.fleet.FleetEquipmentSpec
                .filter(userId, "all", "all", null),
            org.springframework.data.domain.Pageable.unpaged()
        ).getContent();

        return Map.of("equipment", fleet);
    }

    // POST /api/dashboard/fleet — replaces addEquipment()
    @Transactional
    public Map<String, Object> addEquipment(Long userId, Map<String, Object> body) {
        String name = (String) body.get("name");
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Equipment name is required");
        }

        FleetEquipment eq = FleetEquipment.builder()
            .userId(userId)
            .name(name)
            .status(EquipmentStatus.ACTIVE)
            .runningHours(BigDecimal.ZERO)
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();

        return Map.of("equipment", equipmentRepo.save(eq));
    }

    // PATCH /api/dashboard/fleet/:id/status — replaces updateEquipmentStatus()
    @Transactional
    public Map<String, Object> updateEquipmentStatus(Long id, Long userId, String status) {
        FleetEquipment eq = equipmentRepo.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Equipment not found"));

        try {
            eq.setStatus(EquipmentStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Invalid status: " + status);
        }

        eq.setUpdatedAt(Instant.now());
        return Map.of("equipment", equipmentRepo.save(eq));
    }

    // GET /api/dashboard/alerts — stub (returns empty list for now)
    public Map<String, Object> getAlerts(Long userId) {
        return Map.of("alerts", List.of());
    }

    // PATCH /api/dashboard/alerts/read-all — stub
    public void markAllAlertsRead(Long userId) {
        // TODO: implement when alerts table is added
    }

    // PATCH /api/dashboard/alerts/:id/read — stub
    public void markAlertRead(Long alertId, Long userId) {
        // TODO: implement when alerts table is added
    }

    // GET /api/dashboard/parts — stub
    public Map<String, Object> getParts(Long userId) {
        return Map.of("parts", List.of());
    }

    // POST /api/dashboard/parts — stub
    @Transactional
    public Map<String, Object> addPart(Long userId, Map<String, Object> body) {
        return Map.of("message", "Parts module coming soon");
    }

    // GET /api/dashboard/maintenance — stub
    public Map<String, Object> getMaintenance(Long userId) {
        return Map.of("maintenance", List.of());
    }

    // POST /api/dashboard/maintenance — stub
    @Transactional
    public Map<String, Object> addMaintenance(Long userId, Map<String, Object> body) {
        return Map.of("message", "Maintenance module coming soon");
    }

    // GET /api/dashboard/ai-summary — stub
    public Map<String, Object> getAISummary(Long userId) {
        return Map.of("summary", "AI summary coming soon");
    }

    // GET /api/dashboard/news — stub
    public Map<String, Object> getNews() {
        return Map.of("news", List.of());
    }

    // GET /api/dashboard/predictive — stub
    public Map<String, Object> getPredictiveMaintenance(Long userId) {
        return Map.of("predictive", List.of());
    }

    // GET /api/dashboard/production — stub
    public Map<String, Object> getProductionPerformance(Long userId) {
        return Map.of("production", List.of());
    }
}