package com.stratumiq.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.math.BigDecimal;

@Entity
@Table(name = "equipment_operations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentOperation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "equipment_id", nullable = false)
    private Long equipmentId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "event_type", nullable = false, length = 30)
    private String eventType;

    @Column(name = "hours_logged")
    private BigDecimal hoursLogged;

    @Column(name = "total_hours_snapshot")
    private BigDecimal totalHoursSnapshot;

    @Column(name = "downtime_reason", length = 500)
    private String downtimeReason;

    @Column(length = 1000)
    private String note;

    @Column(name = "logged_at", updatable = false)
    @Builder.Default
    private Instant loggedAt = Instant.now();
}