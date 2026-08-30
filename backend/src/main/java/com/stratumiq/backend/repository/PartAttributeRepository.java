package com.stratumiq.backend.repository;

import com.stratumiq.backend.entity.PartAttribute;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PartAttributeRepository extends JpaRepository<PartAttribute, Long> {

    List<PartAttribute> findByPartIdOrderBySortOrderAscIdAsc(Long partId);
}
