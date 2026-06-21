package com.stratumiq.backend.repository;

import com.stratumiq.backend.entity.ActivityLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long>,
        JpaSpecificationExecutor<ActivityLog> {

    List<ActivityLog> findByTenantIdOrderByCreatedAtDesc(Long tenantId, Pageable pageable);

    List<ActivityLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("""
        SELECT COUNT(a)
        FROM ActivityLog a
        WHERE a.createdAt >= :since
        AND (:tenantId IS NULL OR a.tenantId = :tenantId)
        """)
    long countSince(Instant since, Long tenantId);

    @Query("""
        SELECT COUNT(DISTINCT a.userId)
        FROM ActivityLog a
        WHERE a.createdAt >= :since
        AND a.userId IS NOT NULL
        AND (:tenantId IS NULL OR a.tenantId = :tenantId)
        """)
    long countDistinctUsersSince(Instant since, Long tenantId);

    @Query("""
        SELECT a.action, COUNT(a)
        FROM ActivityLog a
        WHERE a.createdAt >= :since
        AND (:tenantId IS NULL OR a.tenantId = :tenantId)
        GROUP BY a.action
        ORDER BY COUNT(a) DESC
        """)
    List<Object[]> countByActionSince(Instant since, Long tenantId);

    @Query("""
        SELECT a.userId, COUNT(a)
        FROM ActivityLog a
        WHERE a.createdAt >= :since
        AND a.userId IS NOT NULL
        AND (:tenantId IS NULL OR a.tenantId = :tenantId)
        GROUP BY a.userId
        ORDER BY COUNT(a) DESC
        """)
    List<Object[]> findTopUsersSince(Instant since, Long tenantId, Pageable pageable);

    @Query("""
        SELECT CAST(a.createdAt AS date), COUNT(a)
        FROM ActivityLog a
        WHERE a.createdAt >= :since
        AND (:tenantId IS NULL OR a.tenantId = :tenantId)
        GROUP BY CAST(a.createdAt AS date)
        ORDER BY CAST(a.createdAt AS date)
        """)
    List<Object[]> countByDaySince(Instant since, Long tenantId);
}
