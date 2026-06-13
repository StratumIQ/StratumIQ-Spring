package com.stratumiq.backend.repository;

import com.stratumiq.backend.entity.ActivityLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    List<ActivityLog> findByTenantIdOrderByCreatedAtDesc(Long tenantId, Pageable pageable);

    List<ActivityLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

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
