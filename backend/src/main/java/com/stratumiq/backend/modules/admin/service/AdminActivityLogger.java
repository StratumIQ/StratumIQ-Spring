package com.stratumiq.backend.modules.admin.service;

import com.stratumiq.backend.entity.*;
import com.stratumiq.backend.repository.ActivityLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;

@Service
public class AdminActivityLogger {

    private final ActivityLogRepository activityLogRepo;

    public AdminActivityLogger(ActivityLogRepository activityLogRepo) {
        this.activityLogRepo = activityLogRepo;
    }

    @Transactional
    public void log(Long tenantId, Long userId, Long actorId,
                    String action, String entityType, Long entityId,
                    Map<String, Object> metadata) {
        ActivityLog entry = ActivityLog.builder()
            .tenantId(tenantId)
            .userId(userId)
            .actorId(actorId)
            .action(action)
            .entityType(entityType)
            .entityId(entityId)
            .metadata(metadata)
            .build();
        activityLogRepo.save(entry);
    }
}
