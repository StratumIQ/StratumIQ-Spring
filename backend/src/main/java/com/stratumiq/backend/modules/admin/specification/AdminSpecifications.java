package com.stratumiq.backend.modules.admin.specification;

import com.stratumiq.backend.common.enums.AccountStatus;
import com.stratumiq.backend.common.enums.EquipmentStatus;
import com.stratumiq.backend.common.enums.Role;
import com.stratumiq.backend.common.enums.TicketStatus;
import com.stratumiq.backend.entity.ActivityLog;
import com.stratumiq.backend.entity.FleetEquipment;
import com.stratumiq.backend.entity.SupportTicket;
import com.stratumiq.backend.entity.User;
import org.springframework.data.jpa.domain.Specification;
import java.time.Instant;
import java.util.List;
import java.util.Locale;

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

    public static Specification<ActivityLog> activityLogs(
            Long tenantId,
            String search,
            String category,
            String action,
            String entityType,
            Long userId,
            Instant from,
            Instant to) {
        return (root, query, cb) -> {
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();

            if (tenantId != null) {
                predicates.add(cb.equal(root.get("tenantId"), tenantId));
            }

            if (action != null && !action.isBlank() && !"all".equalsIgnoreCase(action)) {
                predicates.add(cb.equal(root.get("action"), action.toUpperCase(Locale.ROOT)));
            }

            if (entityType != null && !entityType.isBlank() && !"all".equalsIgnoreCase(entityType)) {
                predicates.add(cb.equal(root.get("entityType"), entityType.toUpperCase(Locale.ROOT)));
            }

            if (userId != null) {
                predicates.add(cb.equal(root.get("userId"), userId));
            }

            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), from));
            }

            if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), to));
            }

            var categoryPredicate = categoryPredicate(category, root, cb);
            if (categoryPredicate != null) {
                predicates.add(categoryPredicate);
            }

            if (search != null && !search.isBlank()) {
                String like = "%" + search.toLowerCase(Locale.ROOT) + "%";
                var userSubquery = query.subquery(Long.class);
                var userRoot = userSubquery.from(User.class);
                userSubquery.select(userRoot.get("id"))
                    .where(cb.and(
                        cb.equal(userRoot.get("id"), root.get("userId")),
                        cb.or(
                            cb.like(cb.lower(userRoot.get("email")), like),
                            cb.like(cb.lower(userRoot.get("firstName")), like),
                            cb.like(cb.lower(userRoot.get("lastName")), like),
                            cb.like(
                                cb.lower(cb.concat(cb.concat(userRoot.get("firstName"), " "), userRoot.get("lastName"))),
                                like
                            )
                        )
                    ));

                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("action")), like),
                    cb.like(cb.lower(root.get("entityType")), like),
                    cb.exists(userSubquery)
                ));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private static jakarta.persistence.criteria.Predicate categoryPredicate(
            String category,
            jakarta.persistence.criteria.Root<ActivityLog> root,
            jakarta.persistence.criteria.CriteriaBuilder cb) {
        if (category == null || category.isBlank() || "all".equalsIgnoreCase(category)) {
            return null;
        }

        String normalized = category.toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "AUTH" -> root.get("action").in(List.of(
                "USER_LOGIN",
                "USER_LOGOUT",
                "USER_LOGIN_FAILED",
                "USER_REGISTRATION_FAILED",
                "EMAIL_OTP_FAILED",
                "PHONE_OTP_FAILED"
            ));
            case "FLEET" -> cb.or(
                cb.like(root.get("action"), "EQUIPMENT_%"),
                cb.like(root.get("action"), "SERVICE_RECORD_%"),
                cb.equal(root.get("entityType"), "EQUIPMENT"),
                cb.equal(root.get("entityType"), "SERVICE_RECORD"),
                cb.equal(root.get("entityType"), "EQUIPMENT_OPERATION")
            );
            case "SUPPORT" -> cb.or(
                cb.like(root.get("action"), "TICKET_%"),
                cb.equal(root.get("entityType"), "SUPPORT_TICKET")
            );
            case "UPLOAD" -> root.get("action").in(List.of("FILE_UPLOADED", "DOCUMENT_UPLOADED"));
            case "CONFIGURATOR" -> cb.equal(root.get("action"), "CONFIGURATOR_OPENED");
            case "REPORT" -> cb.equal(root.get("action"), "REPORT_DOWNLOADED");
            case "ADMIN" -> cb.or(
                cb.like(root.get("action"), "USER_%"),
                cb.like(root.get("action"), "PLATFORM_%")
            );
            default -> null;
        };
    }
}
