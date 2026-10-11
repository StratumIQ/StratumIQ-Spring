# Project architecture

Inspected from the repository on 11 Oct 2026. This describes the **existing** StratumIQ application, not a proposed rewrite.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 16.2.4 (App Router), React 19.2.4, TypeScript 5 |
| Styling | Tailwind CSS 4, CSS custom properties, module CSS (`globals.css`, `dashboard.css`, `admin.css`, `auth.css`, `marketing.css`) |
| Frontend data | TanStack Query 5, `fetch` via `frontend/src/lib/api/client.ts` |
| Icons / motion | lucide-react, react-icons, Framer Motion, Lottie, Recharts, Sonner |
| Backend | Spring Boot 3.5.14, Java 17, Spring Security, Spring Data JPA, Bean Validation |
| Auth | JWT (access + refresh), BCrypt (strength 12), httpOnly cookies + Bearer header |
| Database | PostgreSQL |
| Rate limiting | `RateLimitFilter` |
| Tests | JUnit / Spring Boot Test on the backend. **No frontend unit or E2E test suite** (`frontend/package.json` has `dev`, `build`, `start`, `lint` only). |

## Entry points

- Frontend: `frontend/src/app/layout.tsx` with `ConditionalShell` (public Header/Footer except `/dashboard*` and `/auth`).
- Backend: `com.stratumiq.backend.BackendApplication`.
- Backend config: `application.properties`, `application-dev.yml` (port **5000**), `application-prod.yml`.
- Frontend API base: `NEXT_PUBLIC_API_URL` or `http://localhost:8080/api` (`frontend/src/lib/constants.ts`). **Dev backend port is 5000, frontend default is 8080** — environments must align.

## Layouts and shells

- Marketing: `Header` + page sections + `Footer`.
- Auth: `/auth` unified login/register (`auth/layout.tsx` + `auth.css`). `/auth/login` and `/auth/signup` redirect to `/auth?mode=`.
- Operator/dealer dashboard: `frontend/src/app/dashboard/layout.tsx` (JWT profile load; admins redirected to `/dashboard-admin`).
- Admin: `frontend/src/app/dashboard-admin/layout.tsx` (non-admins redirected to `/dashboard`).

## Authentication and roles

Roles (`com.stratumiq.backend.common.enums.Role`):

- `SUPER_ADMIN`
- `ADMIN`
- `USER` (operator — the closest equivalent to a “buyer” in this product)
- `DEALER`

There is **no** `BUYER` role in code. Dashboard routing (`getDashboardPath`): ADMIN / SUPER_ADMIN → `/dashboard-admin`; USER / DEALER → `/dashboard`.

JWT filter + `@PreAuthorize` / `hasAnyRole` on controllers. Permissions come from `RolePermissionProvider` and are checked as `PERM_*` authorities (for example `PERM_fleet:view`).

`SecurityConfig` permits `/api/auth/**`, CORS preflight, `/`, Swagger, and `GET /uploads/**`. `/api/admin/**` requires ADMIN or SUPER_ADMIN. All other APIs require authentication. CSRF is disabled (stateless JWT).

## Data model (JPA repositories present)

Users, tenants, refresh tokens, OTPs, fleet/equipment, operations, service records, parts (images, documents, attributes), part brands/categories, manufacturers, units of measure, marketing content, support tickets/notes, activity logs.

## Frontend API modules

`frontend/src/lib/api/`: `auth`, `dashboard`, `fleet`, `equipment`, `parts`, `marketing`, `dashboardMarketing`, `activity`, plus admin client `frontend/src/services/admin/adminClient.ts`.

## Integrations

- File upload: backend `UploadController` + `FileStorageService`; Next route `frontend/src/app/api/upload/route.ts`.
- AI assistant stub: `frontend/src/app/api/ai-assistant/route.ts`.
- Demo seed: `POST /api/dashboard/seed-demo` returns a stub message.

## Environment (do not commit secrets)

Backend (from YAML): `FRONTEND_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, JWT expirations, session idle/warning, cookie secure/same-site, database credentials in `application.properties`. Frontend: `NEXT_PUBLIC_API_URL`.
