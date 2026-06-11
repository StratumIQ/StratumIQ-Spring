package com.stratumiq.backend.repository;

import com.stratumiq.backend.entity.FleetEquipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;
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
}