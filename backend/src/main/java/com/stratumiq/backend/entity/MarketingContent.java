package com.stratumiq.backend.entity;

import com.stratumiq.backend.common.enums.MarketingContentStatus;
import com.stratumiq.backend.common.enums.MarketingContentType;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "marketing_content")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketingContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id")
    private Long tenantId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private MarketingContentType type;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 300)
    private String subtitle;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Column(name = "rich_content", columnDefinition = "TEXT")
    private String richContent;

    @Column(name = "image_url", length = 2048)
    private String imageUrl;

    @Column(name = "thumbnail_url", length = 2048)
    private String thumbnailUrl;

    @Column(name = "cta_text", length = 100)
    private String ctaText;

    @Column(name = "cta_url", length = 2048)
    private String ctaUrl;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private MarketingContentStatus status = MarketingContentStatus.DRAFT;

    @Column(name = "is_pinned")
    @Builder.Default
    private Boolean isPinned = false;

    @Builder.Default
    private Integer priority = 0;

    @Column(length = 500)
    private String tags;

    @Column(name = "starts_at")
    private Instant startsAt;

    @Column(name = "ends_at")
    private Instant endsAt;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "updated_by")
    private Long updatedBy;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    @Builder.Default
    private Instant updatedAt = Instant.now();

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
