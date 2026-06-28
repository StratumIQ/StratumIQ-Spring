package com.stratumiq.backend.modules.marketing.specification;

import com.stratumiq.backend.common.enums.MarketingContentStatus;
import com.stratumiq.backend.common.enums.MarketingContentType;
import com.stratumiq.backend.entity.MarketingContent;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public final class MarketingSpecifications {

    private MarketingSpecifications() {}

    public static Specification<MarketingContent> filter(
            String search,
            String status,
            String type,
            Boolean pinned,
            boolean includeArchived
    ) {
        return Specification
            .where(notDeleted())
            .and(searchSpec(search))
            .and(statusSpec(status, includeArchived))
            .and(typeSpec(type))
            .and(pinnedSpec(pinned));
    }

    private static Specification<MarketingContent> notDeleted() {
        return (root, query, cb) -> cb.isNull(root.get("deletedAt"));
    }

    private static Specification<MarketingContent> searchSpec(String search) {
        if (!StringUtils.hasText(search)) return null;
        String pattern = "%" + search.trim().toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
            cb.like(cb.lower(root.get("title")), pattern),
            cb.like(cb.lower(root.get("subtitle")), pattern),
            cb.like(cb.lower(root.get("body")), pattern),
            cb.like(cb.lower(root.get("tags")), pattern)
        );
    }

    private static Specification<MarketingContent> statusSpec(String status, boolean includeArchived) {
        if (StringUtils.hasText(status) && !"all".equalsIgnoreCase(status)) {
            MarketingContentStatus parsed = MarketingContentStatus.valueOf(status.toUpperCase());
            return (root, query, cb) -> cb.equal(root.get("status"), parsed);
        }
        if (!includeArchived) {
            return (root, query, cb) -> cb.notEqual(
                root.get("status"), MarketingContentStatus.ARCHIVED
            );
        }
        return null;
    }

    private static Specification<MarketingContent> typeSpec(String type) {
        if (!StringUtils.hasText(type) || "all".equalsIgnoreCase(type)) return null;
        MarketingContentType parsed = MarketingContentType.valueOf(type.toUpperCase());
        return (root, query, cb) -> cb.equal(root.get("type"), parsed);
    }

    private static Specification<MarketingContent> pinnedSpec(Boolean pinned) {
        if (pinned == null) return null;
        return (root, query, cb) -> cb.equal(root.get("isPinned"), pinned);
    }
}
