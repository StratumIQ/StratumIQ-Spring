package com.stratumiq.backend.modules.admin.service;

import com.stratumiq.backend.entity.ActivityLog;
import com.stratumiq.backend.entity.User;
import com.stratumiq.backend.modules.admin.mapper.AdminMapper;
import com.stratumiq.backend.modules.admin.response.AdminActivityResponse;
import com.stratumiq.backend.modules.admin.specification.AdminSpecifications;
import com.stratumiq.backend.repository.ActivityLogRepository;
import com.stratumiq.backend.repository.UserRepository;
import com.stratumiq.backend.security.AuthenticatedUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class AdminActivityService {

    private static final Logger logger = LoggerFactory.getLogger(AdminActivityService.class);

    private final ActivityLogRepository activityLogRepo;
    private final UserRepository userRepo;
    private final AdminMapper mapper;

    public AdminActivityService(ActivityLogRepository activityLogRepo,
                                UserRepository userRepo,
                                AdminMapper mapper) {
        this.activityLogRepo = activityLogRepo;
        this.userRepo = userRepo;
        this.mapper = mapper;
    }

    public Map<String, Object> listActivities(AuthenticatedUser admin,
            String search,
            String category,
            String action,
            String entityType,
            Long userId,
            String from,
            String to,
            int page,
            int limit) {
        int safePage = Math.max(page, 1);
        int safeLimit = Math.min(Math.max(limit, 1), 100);
        Long tenantId = AdminScope.tenantFilter(admin);
        Instant fromInstant = parseInstant(from, "from");
        Instant toInstant = parseInstant(to, "to");

        Pageable pageable = PageRequest.of(safePage - 1, safeLimit,
            Sort.by(Sort.Direction.DESC, "createdAt"));
        var spec = AdminSpecifications.activityLogs(
            tenantId, search, category, action, entityType, userId, fromInstant, toInstant);
        Page<ActivityLog> result = activityLogRepo.findAll(spec, pageable);

        Map<Long, User> usersById = usersFor(result.getContent());
        List<AdminActivityResponse> activities = result.getContent().stream()
            .filter(log -> isRequiredAction(log.getAction()))
            .map(log -> mapper.toActivityResponse(
                log,
                usersById.get(log.getUserId()),
                usersById.get(log.getActorId())
            ))
            .toList();

        logger.debug("Admin {} listed {} activity rows", admin.userId(), activities.size());

        return Map.of(
            "activities", activities,
            "pagination", Map.of(
                "page", safePage,
                "limit", safeLimit,
                "total", result.getTotalElements(),
                "totalPages", result.getTotalPages()
            )
        );
    }

    public Map<String, Object> getSummary(AuthenticatedUser admin, int days) {
        int safeDays = Math.min(Math.max(days, 1), 365);
        Long tenantId = AdminScope.tenantFilter(admin);
        Instant since = Instant.now().minus(safeDays, ChronoUnit.DAYS);

        long total = activityLogRepo.countSince(since, tenantId);
        long uniqueUsers = activityLogRepo.countDistinctUsersSince(since, tenantId);
        List<Object[]> actionRows = activityLogRepo.countByActionSince(since, tenantId);

        Map<String, Long> countsByAction = actionRows.stream()
            .collect(Collectors.toMap(
                row -> String.valueOf(row[0]),
                row -> ((Number) row[1]).longValue(),
                Long::sum,
                LinkedHashMap::new
            ));

        // Build breakdown for all 8 required actions, including those with 0 count
        List<String> requiredActionsOrder = java.util.List.of(
            "USER_LOGIN",
            "USER_LOGOUT",
            "EQUIPMENT_ADDED",
            "EQUIPMENT_EDITED",
            "DOCUMENT_UPLOADED",
            "REPORT_DOWNLOADED",
            "CONFIGURATOR_OPENED",
            "SUPPORT_REQUEST_SUBMITTED"
        );

        List<Map<String, Object>> actionBreakdown = requiredActionsOrder.stream()
            .map(action -> Map.<String, Object>of(
                "action", action,
                "count", countsByAction.getOrDefault(action, 0L)
            ))
            .toList();

        List<Object[]> topUserRows = activityLogRepo.findTopUsersSince(
            since, tenantId, PageRequest.of(0, 5));
        Set<Long> topUserIds = topUserRows.stream()
            .map(row -> (Long) row[0])
            .collect(Collectors.toCollection(LinkedHashSet::new));
        Map<Long, User> topUsersById = userRepo.findAllById(topUserIds).stream()
            .collect(Collectors.toMap(User::getId, Function.identity()));

        List<Map<String, Object>> topUsers = topUserRows.stream()
            .map(row -> {
                Long id = (Long) row[0];
                User user = topUsersById.get(id);
                return Map.<String, Object>of(
                    "userId", id,
                    "name", displayName(user),
                    "email", user != null && user.getEmail() != null ? user.getEmail() : "",
                    "count", ((Number) row[1]).longValue()
                );
            })
            .toList();

        return Map.of(
            "days", safeDays,
            "totalActivities", total,
            "uniqueUsers", uniqueUsers,
            "loginEvents", countsByAction.getOrDefault("USER_LOGIN", 0L),
            "logoutEvents", countsByAction.getOrDefault("USER_LOGOUT", 0L),
            "equipmentEvents", countAction(countsByAction, "EQUIPMENT_"),
            "documentEvents", countsByAction.getOrDefault("DOCUMENT_UPLOADED", 0L),
            "actionBreakdown", actionBreakdown,
            "topUsers", topUsers
        );
    }

    private Map<Long, User> usersFor(List<ActivityLog> logs) {
        Set<Long> ids = logs.stream()
            .flatMap(log -> java.util.stream.Stream.of(log.getUserId(), log.getActorId()))
            .filter(Objects::nonNull)
            .collect(Collectors.toCollection(LinkedHashSet::new));
        if (ids.isEmpty()) return Map.of();
        return userRepo.findAllById(ids).stream()
            .collect(Collectors.toMap(User::getId, Function.identity()));
    }

    private Instant parseInstant(String value, String field) {
        if (value == null || value.isBlank()) return null;
        try {
            return Instant.parse(value);
        } catch (RuntimeException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Invalid " + field + " timestamp. Use ISO-8601 format.");
        }
    }

    private long sumCategory(Map<String, Long> countsByAction, String category) {
        return countsByAction.entrySet().stream()
            .filter(entry -> category.equals(categoryFor(entry.getKey(), null)))
            .mapToLong(Map.Entry::getValue)
            .sum();
    }

    private String categoryFor(String action, String entityType) {
        String normalizedAction = action != null ? action : "";
        String normalizedEntity = entityType != null ? entityType : "";
        if (normalizedAction.contains("LOGIN") || normalizedAction.contains("LOGOUT")
            || normalizedAction.contains("OTP")) return "AUTH";
        if (normalizedAction.startsWith("EQUIPMENT_") || normalizedAction.startsWith("SERVICE_RECORD_")
            || "EQUIPMENT".equals(normalizedEntity) || "SERVICE_RECORD".equals(normalizedEntity)
            || "EQUIPMENT_OPERATION".equals(normalizedEntity)) return "FLEET";
        if (normalizedAction.startsWith("TICKET_") || "SUPPORT_TICKET".equals(normalizedEntity)) return "SUPPORT";
        if (normalizedAction.contains("UPLOAD")) return "UPLOAD";
        if ("CONFIGURATOR_OPENED".equals(normalizedAction)) return "CONFIGURATOR";
        if ("REPORT_DOWNLOADED".equals(normalizedAction)) return "REPORT";
        if (normalizedAction.startsWith("USER_") || normalizedAction.startsWith("PLATFORM_")) return "ADMIN";
        return "SYSTEM";
    }

    private String displayName(User user) {
        if (user == null) return "Unknown user";
        String name = ((user.getFirstName() != null ? user.getFirstName() : "") + " "
            + (user.getLastName() != null ? user.getLastName() : "")).trim();
        return !name.isBlank() ? name : user.getEmail();
    }

    private boolean isRequiredAction(String action) {
        return action != null && (
            action.equals("USER_LOGIN") ||
            action.equals("USER_LOGOUT") ||
            action.equals("EQUIPMENT_ADDED") ||
            action.equals("EQUIPMENT_EDITED") ||
            action.equals("DOCUMENT_UPLOADED") ||
            action.equals("REPORT_DOWNLOADED") ||
            action.equals("CONFIGURATOR_OPENED") ||
            action.equals("SUPPORT_REQUEST_SUBMITTED")
        );
    }

    private long countAction(Map<String, Long> countsByAction, String prefix) {
        return countsByAction.entrySet().stream()
            .filter(entry -> entry.getKey().startsWith(prefix))
            .mapToLong(Map.Entry::getValue)
            .sum();
    }
}
