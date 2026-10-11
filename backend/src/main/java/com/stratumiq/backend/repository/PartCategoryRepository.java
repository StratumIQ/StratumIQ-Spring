package com.stratumiq.backend.repository;

import com.stratumiq.backend.entity.PartCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PartCategoryRepository
        extends JpaRepository<PartCategory, Long> {

    Optional<PartCategory> findByNameIgnoreCase(
            String name
    );

    boolean existsByNameIgnoreCase(
            String name
    );

    List<PartCategory> findByActiveTrueOrderBySortOrderAscNameAsc();

    List<PartCategory> findByParentId(Long parentId);

    List<PartCategory> findByParentIdAndActiveTrue(Long parentId);

}