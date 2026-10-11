package com.stratumiq.backend.repository;

import com.stratumiq.backend.entity.Manufacturer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ManufacturerRepository extends JpaRepository<Manufacturer, Long> {

    Optional<Manufacturer> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    List<Manufacturer> findByActiveTrueOrderBySortOrderAscNameAsc();

}