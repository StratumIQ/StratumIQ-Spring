package com.stratumiq.backend.repository;

import com.stratumiq.backend.entity.EquipmentOem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EquipmentOemRepository extends JpaRepository<EquipmentOem, Long> {

    boolean existsByNameIgnoreCase(String name);
}