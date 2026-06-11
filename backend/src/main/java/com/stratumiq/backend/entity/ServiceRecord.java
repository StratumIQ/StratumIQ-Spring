package com.stratumiq.backend.entity;

import com.stratumiq.backend.common.enums.MaintenanceStatus;
import com.stratumiq.backend.common.enums.MaintenanceType;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "service_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "equipment_id", nullable = false)
    private Long equipmentId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 200)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "service_type", length = 30)
    private MaintenanceType serviceType;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private MaintenanceStatus status = MaintenanceStatus.SCHEDULED;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "technician_name", length = 120)
    private String technicianName;

    @Column(name = "service_date")
    private LocalDate serviceDate;

    @Column(name = "hours_at_service")
    private Double hoursAtService;

    @Column
    private Double cost;

    @Column(name = "parts_used", length = 1000)
    private String partsUsed;

    @Column(name = "next_service_date")
    private LocalDate nextServiceDate;

    @Column(name = "next_service_hours")
    private Double nextServiceHours;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();
}