package com.stratumiq.backend.repository;

import com.stratumiq.backend.entity.FleetEquipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.Optional;

@Repository
public interface FleetEquipmentRepository
        extends JpaRepository<FleetEquipment, Long>,
                JpaSpecificationExecutor<FleetEquipment> { 

    

    // Scoped by userId — no data leaks between accounts
    Optional<FleetEquipment> findByIdAndUserId(Long id, Long userId);

    // FOR UPDATE lock — used in transactional hours update
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT e FROM FleetEquipment e WHERE e.id = :id AND e.userId = :userId")
    Optional<FleetEquipment> findByIdAndUserIdForUpdate(Long id, Long userId);

    // Fleet summary aggregate — replaces getFleetSummary() in fleet.service.js
    @Query("""
        SELECT
            COUNT(e),
            SUM(CASE WHEN e.status = 'ACTIVE' THEN 1 ELSE 0 END),
            SUM(CASE WHEN e.status = 'IDLE' THEN 1 ELSE 0 END),
            SUM(CASE WHEN e.status = 'MAINTENANCE' THEN 1 ELSE 0 END),
            SUM(CASE WHEN e.status = 'RETIRED' THEN 1 ELSE 0 END),
            AVG(e.runningHours)
        FROM FleetEquipment e WHERE e.userId = :userId
    """)
    Object[] getFleetSummaryRaw(Long userId);

    @Query("SELECT COUNT(e) FROM FleetEquipment e")
    long countAllEquipment();

    @Query("""
        SELECT COUNT(e) FROM FleetEquipment e
        JOIN User u ON u.id = e.userId
        WHERE u.tenantId = :tenantId OR :tenantId IS NULL
        """)
    long countEquipmentByTenant(Long tenantId);

    @Query("SELECT COUNT(DISTINCT e.userId) FROM FleetEquipment e")
    long countDistinctFleetOwners();

    @Query("""
        SELECT COUNT(DISTINCT e.userId) FROM FleetEquipment e
        JOIN User u ON u.id = e.userId
        WHERE :tenantId IS NULL OR u.tenantId = :tenantId
        """)
    long countDistinctFleetOwnersByTenant(Long tenantId);

    @Query("""
        SELECT CAST(e.createdAt AS date), COUNT(e)
        FROM FleetEquipment e
        JOIN User u ON u.id = e.userId
        WHERE e.createdAt >= :since
        AND (:tenantId IS NULL OR u.tenantId = :tenantId)
        GROUP BY CAST(e.createdAt AS date)
        ORDER BY CAST(e.createdAt AS date)
        """)
    java.util.List<Object[]> countEquipmentByDay(Instant since, Long tenantId);

    @Query("""
        SELECT e.status, COUNT(e)
        FROM FleetEquipment e
        JOIN User u ON u.id = e.userId
        WHERE :tenantId IS NULL OR u.tenantId = :tenantId
        GROUP BY e.status
        """)
    java.util.List<Object[]> countByStatus(Long tenantId);
}