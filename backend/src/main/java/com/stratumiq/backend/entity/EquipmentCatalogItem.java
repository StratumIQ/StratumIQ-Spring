package com.stratumiq.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "equipment_catalog")
@Getter
@Setter
@NoArgsConstructor
public class EquipmentCatalogItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "equipment_id", nullable = false, unique = true, length = 64)
    private String equipmentId;

    @Column(name = "oem_id")
    private Long oemId;

    @Column(nullable = false, length = 120)
    private String brand;

    @Column(length = 120)
    private String series;

    @Column(name = "model_name", nullable = false, length = 120)
    private String modelName;

    @Column(name = "equipment_type", nullable = false, length = 40)
    private String equipmentType;

    @Column(name = "mobility_type", nullable = false, length = 20)
    private String mobilityType;

    @Column(name = "application_stage", length = 120)
    private String applicationStage;

    @Column(name = "hard_rock_rated", nullable = false)
    private boolean hardRockRated;

    @Column(name = "year_introduced")
    private Integer yearIntroduced;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void beforeInsert() {
        if (createdAt == null) createdAt = Instant.now();
    }
}