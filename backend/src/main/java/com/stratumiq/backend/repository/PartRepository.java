package com.stratumiq.backend.repository;

import com.stratumiq.backend.common.enums.PartStatus;
import com.stratumiq.backend.entity.Part;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface PartRepository extends
        JpaRepository<Part, Long>,
        JpaSpecificationExecutor<Part> {

    Optional<Part> findByPartNumber(String partNumber);

    List<Part> findByDealerId(Long dealerId);

    List<Part> findByStatus(PartStatus status);

    boolean existsByPartNumber(String partNumber);

    boolean existsByPartNumberAndIdNot(String partNumber, Long id);

    boolean existsBySkuIgnoreCaseAndIdNot(String sku, Long id);

    boolean existsBySkuIgnoreCase(String sku);

    boolean existsBySeoSlug(String seoSlug);
}