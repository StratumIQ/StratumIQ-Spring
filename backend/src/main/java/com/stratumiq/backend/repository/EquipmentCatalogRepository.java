package com.stratumiq.backend.repository;

import com.stratumiq.backend.entity.EquipmentCatalogItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface EquipmentCatalogRepository extends JpaRepository<EquipmentCatalogItem, Long>,
        JpaSpecificationExecutor<EquipmentCatalogItem> {

    Optional<EquipmentCatalogItem> findByEquipmentId(String equipmentId);

    boolean existsByEquipmentId(String equipmentId);
}