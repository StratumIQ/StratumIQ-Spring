package com.stratumiq.backend.modules.admin.service;

import com.stratumiq.backend.modules.marketing.service.MarketingService;
import com.stratumiq.backend.repository.*;
import com.stratumiq.backend.security.AuthenticatedUser;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class AdminDashboardService {

    private final UserRepository userRepo;
    private final FleetEquipmentRepository equipmentRepo;
    private final SupportTicketRepository ticketRepo;
    private final ActivityLogRepository activityLogRepo;
    private final MarketingService marketingService;

    public AdminDashboardService(UserRepository userRepo,
                                 FleetEquipmentRepository equipmentRepo,
                                 SupportTicketRepository ticketRepo,
                                 ActivityLogRepository activityLogRepo,
                                 MarketingService marketingService) {
        this.userRepo = userRepo;
        this.equipmentRepo = equipmentRepo;
        this.ticketRepo = ticketRepo;
        this.activityLogRepo = activityLogRepo;
        this.marketingService = marketingService;
    }

    public Map<String, Object> getKpis(AuthenticatedUser admin) {
        Long tenantId = AdminScope.tenantFilter(admin);
        Instant startOfDay = LocalDate.now(ZoneOffset.UTC).atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant thirtyDaysAgo = Instant.now().minus(30, ChronoUnit.DAYS);

        long totalUsers = userRepo.countActiveUsers(tenantId);
        long activeToday = userRepo.countUsersLoggedInSince(startOfDay, tenantId);
        long newRegistrations = userRepo.countRegisteredSince(thirtyDaysAgo, tenantId);
        long totalFleets = tenantId == null
            ? equipmentRepo.countDistinctFleetOwners()
            : equipmentRepo.countDistinctFleetOwnersByTenant(tenantId);
        long totalEquipment = tenantId == null
            ? equipmentRepo.countAllEquipment()
            : equipmentRepo.countEquipmentByTenant(tenantId);
        long openTickets = tenantId == null
            ? ticketRepo.countOpenTickets()
            : ticketRepo.countOpenTicketsByTenant(tenantId);

        var topCustomers = userRepo.findMostActiveCustomers(tenantId, PageRequest.of(0, 5));
        List<Map<String, Object>> mostActive = topCustomers.stream()
            .map(row -> Map.<String, Object>of(
                "userId", row[0],
                "name", ((row[1] != null ? row[1] : "") + " " + (row[2] != null ? row[2] : "")).trim(),
                "email", row[3],
                "equipmentCount", row[4]
            ))
            .toList();

        return Map.of(
            "totalUsers", totalUsers,
            "activeUsersToday", activeToday,
            "newRegistrations", newRegistrations,
            "totalFleets", totalFleets,
            "totalEquipment", totalEquipment,
            "openSupportTickets", openTickets,
            "mostActiveCustomers", mostActive
        );
    }

    public Map<String, Object> getUserGrowth(AuthenticatedUser admin, int days) {
        Long tenantId = AdminScope.tenantFilter(admin);
        Instant since = Instant.now().minus(days, ChronoUnit.DAYS);
        return Map.of("series", toDailySeries(userRepo.countRegistrationsByDay(since, tenantId)));
    }

    public Map<String, Object> getFleetGrowth(AuthenticatedUser admin, int days) {
        Long tenantId = AdminScope.tenantFilter(admin);
        Instant since = Instant.now().minus(days, ChronoUnit.DAYS);
        return Map.of("series", toDailySeries(equipmentRepo.countEquipmentByDay(since, tenantId)));
    }

    public Map<String, Object> getActivityTimeline(AuthenticatedUser admin, int days) {
        Long tenantId = AdminScope.tenantFilter(admin);
        Instant since = Instant.now().minus(days, ChronoUnit.DAYS);
        return Map.of("series", toDailySeries(activityLogRepo.countByDaySince(since, tenantId)));
    }

    public Map<String, Object> getRecentActivities(AuthenticatedUser admin, int limit) {
        Long tenantId = AdminScope.tenantFilter(admin);
        var page = PageRequest.of(0, limit);
        var logs = tenantId == null
            ? activityLogRepo.findAllByOrderByCreatedAtDesc(page)
            : activityLogRepo.findByTenantIdOrderByCreatedAtDesc(tenantId, page);

        List<Map<String, Object>> items = logs.stream()
            .map(l -> Map.<String, Object>of(
                "id", l.getId(),
                "action", l.getAction(),
                "entityType", l.getEntityType() != null ? l.getEntityType() : "",
                "entityId", l.getEntityId() != null ? l.getEntityId() : 0,
                "createdAt", l.getCreatedAt().toString()
            ))
            .toList();

        return Map.of("activities", items);
    }

    public Map<String, Object> getMarketingHighlights() {
        var items = marketingService.getDashboardMarketing().stream()
            .map(m -> Map.<String, Object>of(
                "id", m.getId(),
                "title", m.getTitle(),
                "type", m.getType().name(),
                "summary", m.getSubtitle() != null ? m.getSubtitle()
                    : (m.getBody() != null ? m.getBody() : ""),
                "status", m.getStatus().name(),
                "isPinned", m.getIsPinned()
            ))
            .toList();
        return Map.of("highlights", items);
    }

    private List<Map<String, Object>> toDailySeries(List<Object[]> rows) {
        return rows.stream()
            .map(r -> Map.<String, Object>of(
                "date", r[0].toString(),
                "count", ((Number) r[1]).longValue()
            ))
            .toList();
    }
}
