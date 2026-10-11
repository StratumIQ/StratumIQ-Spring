# Route and module inventory

Source of truth: `frontend/src/app/**` and backend `@RequestMapping` controllers.

## Public / marketing

| Route | Purpose | Auth |
| --- | --- | --- |
| `/` | Landing: hero, platform, equipment, aftermarket/services, knowledge hub, why, audiences | Public |
| `/auth` | Unified login + registration + OTP | Public |
| `/auth/login` | Redirect → `/auth?mode=login` | Public |
| `/auth/signup` | Redirect → `/auth?mode=register` | Public |

Landing nav hashes: `#platform`, `#equipment`, `#aftermarket`, `#services`, `#blog`, `#about`, `#testimonials`.

## Operator / dealer dashboard (`USER`, `DEALER`) — `/dashboard`

Layout enforces a session and **redirects ADMIN/SUPER_ADMIN away**.

| Route | Purpose | Notes |
| --- | --- | --- |
| `/dashboard` | Home | Live marketing/dashboard APIs |
| `/dashboard/fleet` | Fleet list | Live |
| `/dashboard/fleet/new` | Register fleet | Live |
| `/dashboard/fleet/[id]` | Fleet detail | Live |
| `/dashboard/fleet/[id]/edit` | Edit fleet | Live |
| `/dashboard/equipment` | Equipment list | Live |
| `/dashboard/equipment/new` | Create equipment | Live |
| `/dashboard/equipment/[id]` | Equipment detail | Live |
| `/dashboard/equipment/[id]/edit` | Edit equipment | Live |
| `/dashboard/parts` | Parts catalog | Live |
| `/dashboard/parts/[id]` | Part detail | Live |
| `/dashboard/parts/manage` | Manage listings | Live (role-dependent APIs) |
| `/dashboard/parts/manage/new` | New listing | Live |
| `/dashboard/parts/manage/[id]` | Edit listing | Live |
| `/dashboard/support` | Support tickets | Live |
| `/dashboard/support/[id]` | Ticket thread | Live |
| `/dashboard/news` | News / marketing feed | Live |
| `/dashboard/settings` | Settings | Present |
| `/dashboard/maintenance` | Maintenance | Coming soon (placeholder) |
| `/dashboard/alerts` | Alerts | Coming soon (placeholder) |
| `/dashboard/configurator` | Configurator | Coming soon |
| `/dashboard/solutions` | Solutions | Coming soon |

## Admin (`ADMIN`, `SUPER_ADMIN`) — `/dashboard-admin`

Layout **redirects non-admins** to `/dashboard`.

| Route | Purpose | Notes |
| --- | --- | --- |
| `/dashboard-admin` | Executive KPIs | Live admin APIs |
| `/dashboard-admin/users` | User list | Live |
| `/dashboard-admin/users/[id]` | User detail / status / reset | Live |
| `/dashboard-admin/fleet` | Tenant fleet | Live |
| `/dashboard-admin/fleet/[id]` | Fleet admin detail | Live |
| `/dashboard-admin/activity` | Activity | Live |
| `/dashboard-admin/marketing` | Marketing content | Live |
| `/dashboard-admin/parts` | Marketplace + master data | Live |
| `/dashboard-admin/parts/new` | New listing | Live |
| `/dashboard-admin/parts/[id]` | Listing detail | Live |
| `/dashboard-admin/support` | Support queue | Live |
| `/dashboard-admin/support/[id]` | Ticket admin | Live |
| `/dashboard-admin/companies` | Companies | Coming soon placeholder |

## Backend HTTP surface (prefix `/api`)

- Auth: `/api/auth/register`, `verify-email-otp`, `send-phone-otp`, `verify-phone-otp`, `login`, `refresh` (GET/POST), `logout`
- Dashboard: `/api/dashboard/*` (stats, activity, profile, onboarding, seed-demo stub, AI summary, news, predictive, production, alerts, fleet, parts, maintenance, marketing)
- Fleet: `/api/fleet` CRUD, summary, service records, operations
- Parts catalog: `/api/parts` search, detail, related, inquiries
- Dealer parts: `/api/dealer/parts` (DEALER only)
- Admin parts / brands / categories / UoM / manufacturers: `/api/admin/*`
- User lookups: `/api/part-brands`, `/api/part-categories`, `/api/unit-of-measure`, `/api/manufacturers`
- Support: `/api/support/tickets`
- Admin: `/api/admin/users`, `/fleet`, `/activity`, `/support`, `/marketing`, `/dashboard`
- Upload: `/api/upload`
- Activity: tracking controller

**Discovered frontend page count:** 39 `page.tsx` routes under `frontend/src/app`. There are also 2 Next.js API route handlers (`/api/ai-assistant` and `/api/upload`); those handlers are not page routes. These counts are from the current source tree, not test coverage.
