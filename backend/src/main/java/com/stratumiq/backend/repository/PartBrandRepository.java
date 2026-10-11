package com.stratumiq.backend.repository;

import com.stratumiq.backend.entity.PartBrand;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PartBrandRepository
        extends JpaRepository<PartBrand, Long> {

    Optional<PartBrand> findByNameIgnoreCase(
            String name
    );

    boolean existsByNameIgnoreCase(
            String name
    );

    List<PartBrand> findByActiveTrueOrderBySortOrderAscNameAsc();

}