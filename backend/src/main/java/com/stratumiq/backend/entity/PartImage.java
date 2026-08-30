package com.stratumiq.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "part_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "part_id",
            nullable = false
    )
    private Part part;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @Builder.Default
    @Column(name = "display_order")
    private Integer displayOrder = 0;

    @Builder.Default
    @Column(name = "is_primary")
    private Boolean primary = false;

    @Builder.Default
    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();
}