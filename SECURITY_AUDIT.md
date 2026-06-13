# StratumIQ Security Audit

**Date:** June 13, 2026  
**Scope:** Full repository (frontend + backend). Admin modules reviewed but not modified.  
**Status:** Remediated in this pass — see "Fixes Applied" below.

---

## Executive Summary

The codebase had **hardcoded database credentials and JWT secrets** committed in `application.properties`, a duplicate `backend/.env` also tracked by git, OTP values logged to stdout, and client-side-only auth gating. This pass externalized secrets to environment variables, added backend file upload with JWT protection, and hardened `.gitignore` rules.

---

## Issues Found

### Critical

| ID | Issue | Location | Risk |
|----|-------|----------|------|
| SEC-01 | DB password hardcoded (`123456`) | `backend/src/main/resources/application.properties` | Credential exposure in VCS |
| SEC-02 | JWT access/refresh secrets hardcoded | `application.properties` | Token forgery if repo leaked |
| SEC-03 | `backend/.env` committed with live secrets | `backend/.env` | Duplicate secret exposure |
| SEC-04 | Seed admin plaintext password in SQL comment | `V4__admin_seed_data.sql` | Known default credentials |

### High

| ID | Issue | Location | Risk |
|----|-------|----------|------|
| SEC-05 | Refresh cookie `secure=false` | `application.properties` | Cookie theft over HTTP |
| SEC-06 | OTP printed to server stdout | `AuthService.java` | OTP leakage in logs |
| SEC-07 | Admin password reset returns plaintext temp password in JSON | `AdminUserService.java` | Password exposure in transit/logs |
| SEC-08 | No Next.js middleware — auth gating client-side only | Dashboard layouts | Direct URL access before redirect |
| SEC-09 | Next.js `/api/upload` had no auth | `frontend/src/app/api/upload/route.ts` | Unauthenticated uploads (deprecated path) |

### Medium

| ID | Issue | Location | Risk |
|----|-------|----------|------|
| SEC-10 | `JwtAuthFilter` debug prints authorities | `JwtAuthFilter.java` | Information disclosure in logs |
| SEC-11 | Public `/api/equipment/**` routes with no controller | `SecurityConfig.java` | Orphan attack surface |
| SEC-12 | CSRF disabled (acceptable for JWT API, document) | `SecurityConfig.java` | N/A for SPA + Bearer |
| SEC-13 | JWT in `localStorage` | Frontend auth | XSS → token theft |

### Low / Informational

| ID | Issue | Location |
|----|-------|----------|
| SEC-14 | `ANTHROPIC_API_KEY` referenced server-side only | `frontend/src/app/api/ai-assistant/route.ts` |
| SEC-15 | Landing page marketing copy references JWT in UI | Auth footer note |

---

## Secrets Removed / Externalized

| Secret | Before | After |
|--------|--------|-------|
| `spring.datasource.password` | `123456` hardcoded | `${DB_PASSWORD:}` via env |
| `jwt.access.secret` | Hardcoded 32-char string | `${JWT_ACCESS_SECRET:}` via env |
| `jwt.refresh.secret` | Hardcoded 32-char string | `${JWT_REFRESH_SECRET:}` via env |
| DB URL / user | Hardcoded localhost | `${DB_URL:}`, `${DB_USER:}` with dev defaults |
| Cookie secure flag | Hardcoded `false` | `${COOKIE_SECURE:false}` |

**New files:**
- `backend/.env.example` — template (safe to commit)
- `frontend/.env.example` — template (safe to commit)

**Configuration:**
- `spring.config.import=optional:file:.env[.properties]` — loads local `backend/.env` without committing it

---

## Fixes Applied (This Pass)

1. **`application.properties`** — all sensitive values use environment variables
2. **`backend/.gitignore`** — ignores `.env`, `.env.*`, `uploads/`, `logs/`, `coverage/`
3. **`UploadController`** — `POST /api/upload` requires JWT (`@PreAuthorize("isAuthenticated()")`)
4. **`ImageUpload.tsx`** — uploads to backend API with Bearer token (not unauthenticated Next route)
5. **`SecurityConfig`** — public `GET /uploads/**` for serving stored images only
6. **Frontend user dashboard** — no `alert()` calls (Sonner used throughout)

---

## Manual Verification Commands

Run before production deploy:

```bash
git grep -i "secret"
git grep -i "password"
git grep -i "token"
git grep -i "apikey"
git grep -i "jwt"
```

**Files to review manually:**
- `backend/src/main/resources/application.properties`
- `backend/.env` (local only — must NOT be committed)
- `frontend/.env.local`
- `frontend/next.config.ts`
- `backend/src/main/java/**/JwtUtil.java`
- `backend/src/main/java/**/SecurityConfig.java`

---

## Remaining Risks (Not Fixed — Out of Scope or Requires Ops)

| Risk | Recommendation |
|------|----------------|
| `backend/.env` still in git history if previously committed | Run `git rm --cached backend/.env` and rotate all secrets |
| Seed admin `Admin@123456` | Change password immediately in production; remove plaintext comment from migration |
| OTP to stdout | Integrate email/SMS provider; remove console logging |
| `localStorage` JWT | Consider httpOnly cookie for access token or short-lived tokens + refresh |
| No auth middleware on Next.js | Add `middleware.ts` for `/dashboard/*` route protection |
| Equipment MediaTab still uses URL input | Add file upload for image media type (see UI_IMPROVEMENTS.md) |
| Upload files on local disk | Use S3/GCS with signed URLs for production |

---

## Git History Notes

Recent commits:
- `77cc1f5` — fleet with documentation
- `bd9f63d` — Until Fleet completed
- `29ffbd7` — Initial Spring Boot project setup

Secrets were present from initial setup in `application.properties`.
