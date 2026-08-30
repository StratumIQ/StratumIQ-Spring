package com.stratumiq.backend.repository;

import com.stratumiq.backend.entity.PartDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PartDocumentRepository extends JpaRepository<PartDocument, Long> {

    List<PartDocument> findByPartId(Long partId);

}