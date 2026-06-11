package com.stratumiq.backend.repository;

import com.stratumiq.backend.entity.EquipmentOperation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EquipmentOperationRepository extends JpaRepository<EquipmentOperation, Long> {

    List<EquipmentOperation> findTop50ByEquipmentIdAndUserIdOrderByLoggedAtDesc(
        Long equipmentId, Long userId
    );
}