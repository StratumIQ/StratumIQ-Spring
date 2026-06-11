package com.stratumiq.backend.entity;

import com.stratumiq.backend.common.enums.EquipmentCategory;
import com.stratumiq.backend.common.enums.EquipmentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "equipment")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FleetEquipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 120)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private EquipmentCategory category;

    @Column(name = "serial_number", length = 100)
    private String serialNumber;

    @Column(length = 100)
    private String brand;

    @Column(length = 120)
    private String model;

    @Column(name = "make_year")
    private Integer makeYear;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private EquipmentStatus status = EquipmentStatus.ACTIVE;

    @Column(name = "running_hours")
    @Builder.Default
    private BigDecimal runningHours = BigDecimal.ZERO;

    @Column(length = 255)
    private String location;

    @Column(name = "engine_type", length = 100)
    private String engineType;

    @Column(name = "power_output", length = 80)
    private String powerOutput;

    @Column(length = 80)
    private String capacity;

    @Column(length = 120)
    private String application;

    @Column(columnDefinition = "TEXT")
    private String attachments;

    @Column(name = "image_url", length = 2048)
    private String imageUrl;

    @Column(name = "document_url", length = 2048)
    private String documentUrl;

    @Column(name = "last_service_date")
    private LocalDate lastServiceDate;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    @Builder.Default
    private Instant updatedAt = Instant.now();
    
    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }
}