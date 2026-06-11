package com.stratumiq.backend.repository;

import com.stratumiq.backend.entity.ServiceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceRecordRepository extends JpaRepository<ServiceRecord, Long> {

    List<ServiceRecord> findByEquipmentIdAndUserIdOrderByServiceDateDesc(
        Long equipmentId, Long userId
    );

    Optional<ServiceRecord> findByIdAndEquipmentIdAndUserId(
        Long id, Long equipmentId, Long userId
    );
}