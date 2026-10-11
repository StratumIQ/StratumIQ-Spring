# Role and permission matrix

Derived from `RolePermissionProvider`, `@PreAuthorize` on controllers, `SecurityConfig`, and frontend layouts. **Hiding a nav item is not treated as authorization.**

Legend: **A** = allowed, **D** = denied by backend, **UI** = UI visible but backend may still deny, **N/A** = module is placeholder / not implemented, **NT** = not executed in this pass (no authorized test accounts).

## Application roles

| Role | Dashboard shell | Notes |
| --- | --- | --- |
| USER | `/dashboard` | Operator. Permissions include fleet CRUD + maintenance view/create/edit. |
| DEALER | `/dashboard` | Fleet view + maintenance view only. Dealer parts APIs are DEALER-only. |
| ADMIN | `/dashboard-admin` | Same permission list as SUPER_ADMIN in `RolePermissionProvider`. |
| SUPER_ADMIN | `/dashboard-admin` | Same list as ADMIN in current provider. |
| Anonymous | marketing + `/auth` | `/api/**` except auth/uploads/swagger denied. |

There is **no BUYER role**. USER is the operator/buyer-equivalent.

## Frontend route access (layout guards)

| Module | USER | DEALER | ADMIN | SUPER_ADMIN | Anonymous |
| --- | --- | --- | --- | --- | --- |
| `/` landing | A | A | A | A | A |
| `/auth` | A | A | A | A | A |
| `/dashboard/*` | A | A | Redirect to admin | Redirect to admin | Redirect to `/auth` |
| `/dashboard-admin/*` | Redirect to `/dashboard` | Redirect to `/dashboard` | A | A | Redirect to `/auth` |

These guards are **client-side** (profile fetch). APIs must still reject unauthorized callers.

## Backend permissions (`RolePermissionProvider`)

| Permission | USER | DEALER | ADMIN | SUPER_ADMIN |
| --- | --- | --- | --- | --- |
| fleet:view | A | A | A | A |
| fleet:create / edit / delete | A | D | A | A |
| maintenance:view | A | A | A | A |
| maintenance:create / edit | A | D | A | A |
| admin:dashboard:view | D | D | A | A |
| admin:users:view / edit | D | D | A | A |
| admin:fleet:view / manage | D | D | A | A |
| admin:activity:view | D | D | A | A |
| admin:support:view / manage | D | D | A | A |

## API groups

| API | USER | DEALER | ADMIN / SUPER_ADMIN | Notes |
| --- | --- | --- | --- | --- |
| `/api/auth/**` | A | A | A | Public |
| `/api/fleet` GET | A | A | A | `PERM_fleet:view` or ADMIN |
| `/api/fleet` POST/PATCH/DELETE | A | D | A | DEALER lacks create/edit/delete |
| `/api/parts` catalog GET/inquiry | A (auth) | A | A | Authenticated; not admin-only |
| `/api/dealer/parts` | D | A | D | `@PreAuthorize("hasRole('DEALER')")` |
| `/api/admin/**` | D (403) | D | A | `hasAnyRole(ADMIN, SUPER_ADMIN)` + finer PERM_ on several methods |
| `/api/support/tickets` | A | A | A | Authenticated; service should scope records |
| `/api/upload` | A | A | A | `isAuthenticated()` |

## UI vs policy gap (open)

The operator sidebar lists Equipment, Parts, Configurator, Solutions, Alerts, Support for **both USER and DEALER**. DEALER fleet **create** should fail on the API. Sidebar is not filtered by `RolePermissionProvider`. Treat as **P2**: UI over-exposes actions; backend is the enforcement layer.

## Verification status

| Check | Status |
| --- | --- |
| Code review of layouts + `@PreAuthorize` | Done |
| Login as USER / DEALER / ADMIN / SUPER_ADMIN | **NOT TESTED** — no authorized test accounts and backend Java/Maven not on PATH |
| Direct URL to `/dashboard-admin` as USER | **NOT TESTED** in browser |
| API 401/403 without token | **NOT TESTED** (backend not started in this session) |
