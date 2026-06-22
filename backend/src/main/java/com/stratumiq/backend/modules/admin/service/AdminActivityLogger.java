package com.stratumiq.backend.modules.admin.service;

import com.stratumiq.backend.entity.*;
import com.stratumiq.backend.repository.ActivityLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;
import java.util.Map;

@Service
public class AdminActivityLogger {

    private static final Logger logger = LoggerFactory.getLogger(AdminActivityLogger.class);

    private final ActivityLogRepository activityLogRepo;
    private final TransactionTemplate transactionTemplate;

    public AdminActivityLogger(ActivityLogRepository activityLogRepo,
                               PlatformTransactionManager transactionManager) {
        this.activityLogRepo = activityLogRepo;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
        this.transactionTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    public void log(Long tenantId, Long userId, Long actorId,
                    String action, String entityType, Long entityId,
                    Map<String, Object> metadata) {
        try {
            if (action == null || action.isBlank()) {
                logger.warn("Skipped activity log with blank action for user {}", userId);
                return;
            }

            ActivityLog entry = ActivityLog.builder()
                .tenantId(tenantId)
                .userId(userId)
                .actorId(actorId)
                .action(action.trim().toUpperCase())
                .entityType(entityType != null ? entityType.trim().toUpperCase() : null)
                .entityId(entityId)
                .metadata(metadata)
                .build();
            transactionTemplate.executeWithoutResult(status -> activityLogRepo.save(entry));
        } catch (RuntimeException ex) {
            logger.warn("Failed to write activity log action={} user={} actor={}",
                action, userId, actorId, ex);
        }
    }
}
