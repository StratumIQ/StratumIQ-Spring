package com.stratumiq.backend.modules.activity;

import com.stratumiq.backend.modules.activity.dto.TrackActivityRequest;
import com.stratumiq.backend.modules.admin.service.AdminActivityLogger;
import com.stratumiq.backend.security.AuthenticatedUser;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestController
@RequestMapping("/api/activity")
public class ActivityTrackingController {

    private static final Logger logger = LoggerFactory.getLogger(ActivityTrackingController.class);
    private static final Set<String> ALLOWED_CLIENT_ACTIONS = Set.of(
        "USER_LOGIN",
        "USER_LOGOUT",
        "EQUIPMENT_ADDED",
        "EQUIPMENT_EDITED",
        "DOCUMENT_UPLOADED",
        "REPORT_DOWNLOADED",
        "CONFIGURATOR_OPENED",
        "SUPPORT_REQUEST_SUBMITTED"
    );

    private final AdminActivityLogger activityLogger;

    public ActivityTrackingController(AdminActivityLogger activityLogger) {
        this.activityLogger = activityLogger;
    }

    @PostMapping("/track")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> track(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody TrackActivityRequest req) {
        String action = req.action().trim().toUpperCase(Locale.ROOT);
        if (!ALLOWED_CLIENT_ACTIONS.contains(action)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported activity action");
        }

        String entityType = req.entityType() != null && !req.entityType().isBlank()
            ? req.entityType().trim().toUpperCase(Locale.ROOT)
            : "USER_ACTIVITY";

        activityLogger.log(
            user.tenantId(),
            user.userId(),
            user.userId(),
            action,
            entityType,
            req.entityId(),
            sanitizeMetadata(req.metadata())
        );
        logger.debug("Tracked client activity {} for user {}", action, user.userId());

        return ResponseEntity.accepted().body(Map.of("message", "Activity tracked"));
    }

    private Map<String, Object> sanitizeMetadata(Map<String, Object> metadata) {
        if (metadata == null || metadata.isEmpty()) return Map.of();
        Map<String, Object> safe = new LinkedHashMap<>();
        metadata.entrySet().stream()
            .filter(entry -> entry.getKey() != null && entry.getValue() != null)
            .limit(12)
            .forEach(entry -> safe.put(entry.getKey(), sanitizeValue(entry.getValue())));
        return safe;
    }

    private Object sanitizeValue(Object value) {
        if (value instanceof String str) {
            return str.length() > 300 ? str.substring(0, 300) : str;
        }
        if (value instanceof Number || value instanceof Boolean) {
            return value;
        }
        return String.valueOf(value);
    }
}
