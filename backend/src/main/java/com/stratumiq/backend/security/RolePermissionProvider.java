package com.stratumiq.backend.security;

import com.stratumiq.backend.common.enums.Role;

import java.util.List;

public final class RolePermissionProvider {

    private RolePermissionProvider() {
    }

    public static List<String> permissionsForRole(Role role) {
        return switch (role) {
            case SUPER_ADMIN -> List.of(
                "fleet:view",        "fleet:create",
                "fleet:edit",        "fleet:delete",
                "maintenance:view",  "maintenance:create",
                "maintenance:edit",
                "admin:dashboard:view",
                "admin:users:view",  "admin:users:edit",
                "admin:fleet:view",
                "admin:activity:view",
                "admin:support:view", "admin:support:manage"
            );
            case ADMIN -> List.of(
                "fleet:view",        "fleet:create",
                "fleet:edit",        "fleet:delete",
                "maintenance:view",  "maintenance:create",
                "maintenance:edit",
                "admin:dashboard:view",
                "admin:users:view",  "admin:users:edit",
                "admin:fleet:view",
                "admin:activity:view",
                "admin:support:view", "admin:support:manage"
            );
            case DEALER -> List.of(
                "fleet:view",
                "maintenance:view"
            );
            case USER -> List.of(
                "fleet:view",
                "fleet:create",
                "fleet:edit",
                "fleet:delete",
                "maintenance:view",
                "maintenance:create",
                "maintenance:edit"
            );
        };
    }
}
