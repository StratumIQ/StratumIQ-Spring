package com.stratumiq.backend.repository;

import com.stratumiq.backend.entity.MarketingContent;
import com.stratumiq.backend.common.enums.MarketingContentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface MarketingContentRepository
        extends JpaRepository<MarketingContent, Long> {

    List<MarketingContent> findByDeletedAtIsNull();

    List<MarketingContent> findByIsActiveTrueAndDeletedAtIsNull();

    List<MarketingContent> findByTypeAndDeletedAtIsNull(
            MarketingContentType type
    );

    List<MarketingContent> findByStartsAtBeforeAndEndsAtAfterAndDeletedAtIsNull(
            Instant now1,
            Instant now2
    );

    List<MarketingContent>
findByIsActiveTrueAndDeletedAtIsNullOrderBySortOrderAsc();

List<MarketingContent>
findByIsActiveTrueAndDeletedAtIsNullAndStartsAtBeforeOrderBySortOrderAsc(
        Instant now
);
List<MarketingContent>
findByIsActiveTrueAndDeletedAtIsNullAndStartsAtBeforeAndEndsAtAfterOrderBySortOrderAsc(
        Instant now1,
        Instant now2
);
@Query("""
SELECT m
FROM MarketingContent m
WHERE m.isActive = true
AND m.deletedAt IS NULL
AND (m.startsAt IS NULL OR m.startsAt <= :now)
AND (m.endsAt IS NULL OR m.endsAt >= :now)
ORDER BY m.sortOrder ASC
""")
List<MarketingContent> findActiveDashboardContent(
        @Param("now") Instant now
);

@Query("""
SELECT m
FROM MarketingContent m
WHERE m.isActive = true
AND m.deletedAt IS NULL
AND (m.startsAt IS NULL OR m.startsAt <= :now)
AND (m.endsAt IS NULL OR m.endsAt >= :now)
ORDER BY m.sortOrder ASC
""")
List<MarketingContent> findActiveDashboardContent(
        @Param("now") Instant now,
        org.springframework.data.domain.Pageable pageable
);

}