package com.stratumiq.backend.modules.admin.specification;

import com.stratumiq.backend.common.enums.AccountStatus;
import com.stratumiq.backend.common.enums.EquipmentStatus;
import com.stratumiq.backend.common.enums.Role;
import com.stratumiq.backend.common.enums.TicketStatus;
import com.stratumiq.backend.entity.FleetEquipment;
import com.stratumiq.backend.entity.SupportTicket;
import com.stratumiq.backend.entity.User;
import org.springframework.data.jpa.domain.Specification;

public final class AdminSpecifications {

    private AdminSpecifications() {}

    public static Specification<User> users(
            Long tenantId, String search, String role, String status) {
        return (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
            predicates.add(cb.isNull(root.get("deletedAt")));

            if (tenantId != null) {
                predicates.add(cb.equal(root.get("tenantId"), tenantId));
            }

            if (role != null && !role.isBlank() && !"all".equalsIgnoreCase(role)) {
                try {
                    predicates.add(cb.equal(root.get("role"), Role.valueOf(role.toUpperCase())));
                } catch (IllegalArgumentException ignored) {}
            }

            if (status != null && !status.isBlank() && !"all".equalsIgnoreCase(status)) {
                try {
                    predicates.add(cb.equal(root.get("accountStatus"),
                        AccountStatus.valueOf(status.toUpperCase())));
                } catch (IllegalArgumentException ignored) {}
            }

            if (search != null && !search.isBlank()) {
                String like = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("email")), like),
                    cb.like(cb.lower(root.get("firstName")), like),
                    cb.like(cb.lower(root.get("lastName")), like)
                ));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    public static Specification<FleetEquipment> equipment(
            Long tenantId, String status, String search, Long userId) {
        return (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();

            if (userId != null) {
                predicates.add(cb.equal(root.get("userId"), userId));
            }

            if (status != null && !status.isBlank() && !"all".equalsIgnoreCase(status)) {
                try {
                    predicates.add(cb.equal(root.get("status"),
                        EquipmentStatus.valueOf(status.toUpperCase())));
                } catch (IllegalArgumentException ignored) {}
            }

            if (search != null && !search.isBlank()) {
                String like = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("name")), like),
                    cb.like(cb.lower(root.get("brand")), like),
                    cb.like(cb.lower(root.get("model")), like),
                    cb.like(cb.lower(root.get("serialNumber")), like)
                ));
            }

            if (tenantId != null) {
                var subquery = query.subquery(Long.class);
                var userRoot = subquery.from(User.class);
                subquery.select(userRoot.get("id"))
                    .where(cb.and(
                        cb.equal(userRoot.get("tenantId"), tenantId),
                        cb.equal(userRoot.get("id"), root.get("userId"))
                    ));
                predicates.add(cb.exists(subquery));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    public static Specification<SupportTicket> tickets(
            Long tenantId, String status, Long assignedTo, String search) {
        return (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
            predicates.add(cb.isNull(root.get("deletedAt")));

            if (tenantId != null) {
                predicates.add(cb.equal(root.get("tenantId"), tenantId));
            }

            if (status != null && !status.isBlank() && !"all".equalsIgnoreCase(status)) {
                try {
                    predicates.add(cb.equal(root.get("status"),
                        TicketStatus.valueOf(status.toUpperCase())));
                } catch (IllegalArgumentException ignored) {}
            }

            if (assignedTo != null) {
                predicates.add(cb.equal(root.get("assignedTo"), assignedTo));
            }

            if (search != null && !search.isBlank()) {
                String like = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("subject")), like),
                    cb.like(cb.lower(root.get("ticketNumber")), like)
                ));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }
}
