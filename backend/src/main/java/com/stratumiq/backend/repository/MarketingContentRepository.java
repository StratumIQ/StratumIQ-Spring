package com.stratumiq.backend.repository;

import com.stratumiq.backend.entity.MarketingContent;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface MarketingContentRepository
        extends JpaRepository<MarketingContent, Long>,
                JpaSpecificationExecutor<MarketingContent> {

    List<MarketingContent> findByDeletedAtIsNull();

    @Query("""
        SELECT m FROM MarketingContent m
        WHERE m.status = com.stratumiq.backend.common.enums.MarketingContentStatus.PUBLISHED
        AND m.deletedAt IS NULL
        AND (m.startsAt IS NULL OR m.startsAt <= :now)
        AND (m.endsAt IS NULL OR m.endsAt >= :now)
        ORDER BY m.isPinned DESC, m.priority DESC,
                 COALESCE(m.startsAt, m.createdAt) DESC
        """)
    List<MarketingContent> findDashboardFeatured(
            @Param("now") Instant now,
            Pageable pageable
    );

    @Query("""
        SELECT m FROM MarketingContent m
        WHERE m.status = com.stratumiq.backend.common.enums.MarketingContentStatus.PUBLISHED
        AND m.deletedAt IS NULL
        AND (m.startsAt IS NULL OR m.startsAt <= :now)
        AND (m.endsAt IS NULL OR m.endsAt >= :now)
        ORDER BY m.isPinned DESC, m.priority DESC,
                 COALESCE(m.startsAt, m.createdAt) DESC
        """)
    List<MarketingContent> findAllPublishedActive(@Param("now") Instant now, Pageable pageable);

    long countByDeletedAtIsNull();

    @Query("""
        SELECT COUNT(m) FROM MarketingContent m
        WHERE m.status = com.stratumiq.backend.common.enums.MarketingContentStatus.PUBLISHED
        AND m.deletedAt IS NULL
        AND (m.startsAt IS NULL OR m.startsAt <= :now)
        AND (m.endsAt IS NULL OR m.endsAt >= :now)
        """)
    long countPublishedActive(@Param("now") Instant now);
}
