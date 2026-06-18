package com.stratumiq.backend.modules.admin.service;

import com.stratumiq.backend.common.enums.Role;
import com.stratumiq.backend.security.AuthenticatedUser;

public final class AdminScope {

    private AdminScope() {}

    /** Returns tenant filter: null for SUPER_ADMIN (platform-wide), tenantId for ADMIN. */
    public static Long tenantFilter(AuthenticatedUser admin) {
        if (Role.SUPER_ADMIN.name().equals(admin.role())) {
            return null;
        }
        return admin.tenantId();
    }

    public static boolean isSuperAdmin(AuthenticatedUser admin) {
        return Role.SUPER_ADMIN.name().equals(admin.role());
    }
}
