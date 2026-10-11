package com.stratumiq.backend.repository;

import com.stratumiq.backend.entity.PartImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PartImageRepository extends JpaRepository<PartImage, Long> {

    List<PartImage> findByPartIdOrderByDisplayOrderAscIdAsc(Long partId);
}
