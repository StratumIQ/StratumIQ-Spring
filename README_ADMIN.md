# StratumIQ Admin Platform

Enterprise admin dashboard for `ADMIN` and `SUPER_ADMIN` roles. Completely separate from the existing USER/DEALER dashboard at `/dashboard`.

## Architecture

```
Browser → Next.js (/dashboard-admin) → Spring Boot (/api/admin/**) → PostgreSQL
```

- **USER / DEALER** → `/dashboard` (unchanged)
- **ADMIN / SUPER_ADMIN** → `/dashboard-admin` (new)

Role routing is centralized in `frontend/src/lib/routing/dashboardRoutes.ts`.

## Folder Structure

### Backend
```
backend/src/main/java/com/stratumiq/backend/modules/admin/
├── controller/   AdminDashboardController, AdminUserController, AdminFleetController, AdminSupportController
├── service/      Business logic + AdminScope (tenant filtering)
├── dto/          Request validation
├── response/     Response records
├── mapper/       Entity → DTO mapping
└── specification/ JPA dynamic filters
```

### Frontend
```
frontend/src/app/dashboard-admin/     Admin pages
frontend/src/components/admin/        Admin UI components
frontend/src/services/admin/          API client
frontend/src/types/admin/             TypeScript types
frontend/src/lib/routing/             Role routing
```

## API Flow

1. Admin logs in via `/auth`
2. Profile fetched → role checked → redirect to `/dashboard-admin`
3. Pages call `adminApi.*` → `dashApi("/admin/...")` with JWT
4. Backend validates JWT + `@PreAuthorize` on each endpoint

## Authentication Flow

1. `POST /api/auth/login` → access token + refresh cookie
2. JWT contains `role` and `permissions` (including `admin:*`)
3. Admin layouts verify role before rendering

## Role Routing Flow

| Role | Dashboard |
|------|-----------|
| USER | `/dashboard` |
| DEALER | `/dashboard` |
| ADMIN | `/dashboard-admin` (tenant-scoped) |
| SUPER_ADMIN | `/dashboard-admin` (platform-wide) |

Guards:
- `dashboard/layout.tsx` redirects admins away from user dashboard
- `dashboard-admin/layout.tsx` redirects non-admins to user dashboard

## Database Relationships

- `support_tickets.user_id` → `users.id` (customer)
- `support_tickets.assigned_to` → `users.id` (admin assignee)
- `support_ticket_notes.ticket_id` → `support_tickets.id`
- `activity_logs` → audit trail for admin actions
- `equipment.user_id` → fleet owner (used for admin fleet monitoring)

Migrations: `V3__admin_platform_schema.sql`, `V4__admin_seed_data.sql`

## Development Guide

### Backend
```bash
cd backend
mvn spring-boot:run
```
Swagger: http://localhost:5000/swagger-ui/index.html

### Frontend
```bash
cd frontend
npm run dev
```

### Seed admin user
- Email: `admin@stratumiq.com`
- Password: `Admin@123456`

### API docs
See [docs/API_ADMIN.md](docs/API_ADMIN.md)

## Phase 1 Modules (Implemented)

1. Executive Dashboard — KPIs, charts, activity
2. User Management — list, detail, activate/disable, role, reset password
3. Fleet Monitoring — read-only equipment views
4. Support Center — tickets, status, internal notes

## Future Roadmap (Phase 2)

- Company Management
- Activity Monitoring (extended)
- Lead Generation
- Marketing Center
- Content Management
- Analytics
- Revenue Tracking

Placeholder route: `/dashboard-admin/companies`
