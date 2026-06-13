package com.stratumiq.backend.repository;

import com.stratumiq.backend.entity.EquipmentOperation;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EquipmentOperationRepository
        extends JpaRepository<EquipmentOperation, Long>,
                JpaSpecificationExecutor<EquipmentOperation> {

    List<EquipmentOperation> findTop50ByEquipmentIdAndUserIdOrderByLoggedAtDesc(
        Long equipmentId, Long userId
    );

    @Query("""
        SELECT o FROM EquipmentOperation o
        JOIN User u ON u.id = o.userId
        WHERE :tenantId IS NULL OR u.tenantId = :tenantId
        ORDER BY o.loggedAt DESC
        """)
    List<EquipmentOperation> findRecentOperations(Long tenantId, Pageable pageable);
}