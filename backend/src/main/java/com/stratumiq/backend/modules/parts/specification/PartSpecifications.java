package com.stratumiq.backend.modules.parts.specification;

import com.stratumiq.backend.common.enums.PartStatus;
import com.stratumiq.backend.entity.Part;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.Collection;

public final class PartSpecifications {

    private PartSpecifications() {
    }

    public static Specification<Part> hasStatus(PartStatus status) {
        return (root, query, cb) ->
                status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    public static Specification<Part> isActive(Boolean active) {
        return (root, query, cb) ->
                active == null ? cb.conjunction() : cb.equal(root.get("active"), active);
    }

    public static Specification<Part> hasDealer(Long dealerId) {
        return (root, query, cb) ->
                dealerId == null ? cb.conjunction() : cb.equal(root.get("dealerId"), dealerId);
    }

    public static Specification<Part> inCategoryIds(Collection<Long> categoryIds) {
        return (root, query, cb) -> {
            if (categoryIds == null || categoryIds.isEmpty()) {
                return cb.conjunction();
            }
            return root.get("category").get("id").in(categoryIds);
        };
    }

    public static Specification<Part> hasBrandId(Long brandId) {
        return (root, query, cb) ->
                brandId == null ? cb.conjunction() : cb.equal(root.get("brand").get("id"), brandId);
    }

    public static Specification<Part> hasManufacturerId(Long manufacturerId) {
        return (root, query, cb) ->
                manufacturerId == null
                        ? cb.conjunction()
                        : cb.equal(root.get("manufacturer").get("id"), manufacturerId);
    }

    public static Specification<Part> hasUnitOfMeasureId(Long unitOfMeasureId) {
        return (root, query, cb) ->
                unitOfMeasureId == null
                        ? cb.conjunction()
                        : cb.equal(root.get("unitOfMeasure").get("id"), unitOfMeasureId);
    }

    public static Specification<Part> isFeatured(Boolean featured) {
        return (root, query, cb) ->
                featured == null ? cb.conjunction() : cb.equal(root.get("featured"), featured);
    }

    public static Specification<Part> notId(Long excludePartId) {
        return (root, query, cb) ->
                excludePartId == null ? cb.conjunction() : cb.notEqual(root.get("id"), excludePartId);
    }

    public static Specification<Part> inStock(Boolean inStock) {
        return (root, query, cb) -> {
            if (!Boolean.TRUE.equals(inStock)) {
                return cb.conjunction();
            }
            return cb.and(
                    cb.greaterThan(root.get("quantity"), 0),
                    cb.equal(root.get("status"), PartStatus.ACTIVE)
            );
        };
    }

    public static Specification<Part> keyword(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) {
                return cb.conjunction();
            }
            if (query != null) {
                query.distinct(true);
            }
            String search = "%" + keyword.toLowerCase().trim() + "%";
            var brandJoin = root.join("brand", jakarta.persistence.criteria.JoinType.LEFT);
            var manufacturerJoin = root.join("manufacturer", jakarta.persistence.criteria.JoinType.LEFT);
            return cb.or(
                    cb.like(cb.lower(root.get("partName")), search),
                    cb.like(cb.lower(root.get("partNumber")), search),
                    cb.like(cb.lower(cb.coalesce(root.get("sku"), "")), search),
                    cb.like(cb.lower(cb.coalesce(root.get("oemNumber"), "")), search),
                    cb.like(cb.lower(cb.coalesce(root.get("description"), "")), search),
                    cb.like(cb.lower(root.get("category").get("name")), search),
                    cb.like(cb.lower(cb.coalesce(brandJoin.get("name"), "")), search),
                    cb.like(cb.lower(cb.coalesce(manufacturerJoin.get("name"), "")), search)
            );
        };
    }

    public static Specification<Part> minPrice(BigDecimal min) {
        return (root, query, cb) ->
                min == null ? cb.conjunction() : cb.greaterThanOrEqualTo(root.get("price"), min);
    }

    public static Specification<Part> maxPrice(BigDecimal max) {
        return (root, query, cb) ->
                max == null ? cb.conjunction() : cb.lessThanOrEqualTo(root.get("price"), max);
    }
}
