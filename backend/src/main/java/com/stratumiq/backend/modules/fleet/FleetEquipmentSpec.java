package com.stratumiq.backend.modules.fleet;

import com.stratumiq.backend.common.enums.EquipmentCategory;
import com.stratumiq.backend.common.enums.EquipmentStatus;
import com.stratumiq.backend.entity.FleetEquipment;
import org.springframework.data.jpa.domain.Specification;

// Dynamic query builder — replaces the manual WHERE clause
// construction in listEquipment() from fleet.service.js
public class FleetEquipmentSpec {

    public static Specification<FleetEquipment> filter(
            Long userId, String status, String category, String search) {

        return (root, query, cb) -> {
            var predicates = new java.util.ArrayList<>();

            // Always scope by userId — no data leaks
            predicates.add(cb.equal(root.get("userId"), userId));

            // status filter — replaces: if (status && status !== 'all')
            if (status != null && !status.equals("all") && !status.isBlank()) {
                try {
                    predicates.add(cb.equal(root.get("status"),
                        EquipmentStatus.valueOf(status.toUpperCase())));
                } catch (IllegalArgumentException ignored) {}
            }

            // category filter
            if (category != null && !category.equals("all") && !category.isBlank()) {
                try {
                    predicates.add(cb.equal(root.get("category"),
                        EquipmentCategory.valueOf(category.toUpperCase())));
                } catch (IllegalArgumentException ignored) {}
            }

            // search — replaces: name ILIKE OR brand ILIKE OR model ILIKE
            if (search != null && !search.isBlank()) {
                String like = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("name")),         like),
                    cb.like(cb.lower(root.get("brand")),        like),
                    cb.like(cb.lower(root.get("model")),        like),
                    cb.like(cb.lower(root.get("serialNumber")), like)
                ));
            }

            return cb.and(predicates.toArray(
                new jakarta.persistence.criteria.Predicate[0]));
        };
    }
}