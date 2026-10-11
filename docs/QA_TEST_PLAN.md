# QA test plan

Based on discovered routes and code, not assumed product marketing.

## Scope

- Marketing landing and auth UI (visual + client validation).
- Dashboard and admin shells (code + layout guards).
- Backend authorization model (code review).
- Responsive viewports for public pages when a browser is available.

## Out of scope unless environment is available

- Production data, real user passwords, destructive DB operations.
- Load / penetration testing.
- Full API + DB persistence for every CRUD path (requires PostgreSQL + running Spring Boot + test users).

## Tooling

| Check | Command / method |
| --- | --- |
| Frontend lint | `npm run lint` in `frontend/` |
| Frontend build | `npm run build` |
| Backend tests | `mvn test` in `backend/` (Java 17 + Maven required) |
| Manual / browser | Next dev server + Cursor browser tools |
| Auth | Only with authorized test accounts |

## High-value cases

### AUTH-01 Login happy path
Preconditions: valid USER/ADMIN credentials, API up.  
Steps: open `/auth`, valid email+password, submit.  
Expect: success toast, redirect `/dashboard` or `/dashboard-admin` by role.

### AUTH-02 Invalid credentials
Empty fields, bad email format, wrong password. Expect inline errors / toast, no session.

### AUTH-03 Session
Logout, then open `/dashboard` — redirect `/auth`. Refresh while logged in — session restored via refresh cookie/token.

### AUTH-04 Cross-role URL
USER opens `/dashboard-admin` — redirected. ADMIN opens `/dashboard` — redirected to admin.

### AUTH-05 Password recovery affordance
The `/auth` page displays a "Forgot password?" button, but no password-recovery handler or backend endpoint was found. Treat this as an open product gap, not a passing workflow; implementing recovery needs an agreed delivery and verification flow.

### FLEET-01 USER CRUD
Create/list/edit/delete equipment; invalid empty required fields; pagination if present.

### FLEET-02 DEALER
View fleet; create should 403.

### PARTS-01 Catalog
Search, empty search, open detail, inquiry validation.

### SUPPORT-01
Create ticket, open thread, add note; admin assign/resolve.

### ADMIN-01 Users
List, filter, open detail, status change, password reset (admin only).

### RESP-01 Landing
Viewports 375, 430, 768, 1024, 1440: no horizontal overflow, usable header, wrapping CTAs.

### A11Y-01
Focus visible on primary buttons; login fields labelled; mobile menu `aria-expanded`.

## Status convention

PASS / FAIL / BLOCKED / NOT TESTED. Do not mark PASS without execution.
