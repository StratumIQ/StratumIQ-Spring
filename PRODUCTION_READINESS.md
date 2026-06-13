# StratumIQ Production Readiness

**Date:** June 13, 2026  
**Target:** User/Dealer dashboard + authentication flows (Admin dashboard untouched)

---

## Frontend Checklist

| Item | Status | Notes |
|------|--------|-------|
| Login page — desktop/tablet/mobile | ✅ Done | Grid layout, glass card, SVG + Lottie, no vertical stretch |
| Signup — phone validation (India 10-digit) | ✅ Done | Inline errors, numeric filter |
| Signup — password strength meter | ✅ Done | 5-rule live meter with lowercase check |
| Signup — email format + duplicate | ✅ Done | Inline + Sonner for backend 409 |
| OTP auto-focus / paste / backspace | ✅ Done | Dedicated `OtpInput` component |
| Sonner toasts (no `alert()`) | ✅ Done | Already in place; verified no `alert()` |
| Design tokens (typography, spacing, radius, shadows) | ✅ Done | `TOKENS` in `constants.ts` + CSS vars in `dashboard.css` |
| Emoji removal (user dashboard) | ✅ Done | Fleet, Equipment, shared components |
| Fleet image upload (device) | ✅ Done | `ImageUpload` → backend `/api/upload` |
| Fleet detail polish | ✅ Done | Section cards, hover, skeleton loading |
| Responsive auth + dashboard | ✅ Done | Auth breakpoints 1100/600px; fleet mobile grid |
| `npm run build` passes | ✅ Done | Verified June 13, 2026 |
| `.env.local` not committed | ✅ Done | `frontend/.gitignore` ignores `.env*` |
| Equipment MediaTab file upload | ⏳ TODO | Still URL-based for catalog media |
| Next.js auth middleware | ⏳ TODO | Client-side layout guard only |
| E2E / integration tests | ⏳ TODO | No automated auth flow tests |

---

## Backend Checklist

| Item | Status | Notes |
|------|--------|-------|
| Secrets in environment variables | ✅ Done | `application.properties` uses `${VAR}` |
| `.env.example` committed | ✅ Done | `backend/.env.example` |
| JWT dual-secret design | ✅ Existing | `JwtUtil.java` |
| BCrypt password hashing | ✅ Existing | Cost factor 10 |
| Email duplicate check on signup | ✅ Existing | `existsByEmail` + DB unique |
| File upload endpoint | ✅ Done | `POST /api/upload` (JWT required) |
| Static file serving for uploads | ✅ Done | `WebConfig` + `GET /uploads/**` |
| `mvnw compile` passes | ✅ Done | Verified June 13, 2026 |
| Flyway migrations | ✅ Existing | V1–V4 |
| Real email/SMS OTP delivery | ⏳ TODO | OTP still logged to stdout |
| Cloud object storage for uploads | ⏳ TODO | Local disk only |
| Rate limiting on auth endpoints | ⏳ TODO | Not implemented |
| HTTPS / secure cookies in prod | ⏳ TODO | Set `COOKIE_SECURE=true` |

---

## Security Checklist

| Item | Status |
|------|--------|
| Hardcoded JWT secrets removed from properties | ✅ |
| Hardcoded DB password removed from properties | ✅ |
| `backend/.gitignore` covers `.env`, `uploads/`, `logs/` | ✅ |
| Upload endpoint requires authentication | ✅ |
| Security audit documented | ✅ `SECURITY_AUDIT.md` |
| Rotate secrets if `.env` was ever pushed | ⏳ Manual |
| Remove seed password comment from migration | ⏳ Manual |
| Security headers (HSTS, CSP) | ⏳ TODO |

---

## Environment Variables Checklist

### Backend (required for production)

| Variable | Required | Default (dev) |
|----------|----------|---------------|
| `DB_URL` | Yes | `jdbc:postgresql://localhost:5432/stratumiq` |
| `DB_USER` | Yes | `postgres` |
| `DB_PASSWORD` | **Yes** | _(none — must set)_ |
| `JWT_ACCESS_SECRET` | **Yes** | _(none — must set, ≥32 chars)_ |
| `JWT_REFRESH_SECRET` | **Yes** | _(none — must set, ≥32 chars)_ |
| `FRONTEND_URL` | Yes | `http://localhost:3000` |
| `COOKIE_SECURE` | Prod: `true` | `false` |
| `UPLOAD_DIR` | Optional | `uploads` |

### Frontend

| Variable | Required | Default |
|----------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:5000/api` |
| `ANTHROPIC_API_KEY` | Optional | AI assistant disabled if unset |

---

## Deployment Checklist

### Pre-deploy

- [ ] Copy `backend/.env.example` → `backend/.env` and fill secrets
- [ ] Copy `frontend/.env.example` → `frontend/.env.local`
- [ ] Generate strong JWT secrets: `openssl rand -base64 48`
- [ ] Set `COOKIE_SECURE=true` and `FRONTEND_URL` to production domain
- [ ] Run `git rm --cached backend/.env` if `.env` was previously committed
- [ ] Rotate all secrets that were ever in git history
- [ ] Change seed admin password (`admin@stratumiq.com`)
- [ ] PostgreSQL provisioned with Flyway migrations applied
- [ ] CORS `FRONTEND_URL` matches deployed frontend origin

### Build & run

```bash
# Backend
cd backend && ./mvnw clean package -DskipTests
java -jar target/*.jar

# Frontend
cd frontend && npm ci && npm run build && npm start
```

### Post-deploy smoke test

- [ ] Register → email OTP → phone OTP → dashboard redirect
- [ ] Login with remember-me
- [ ] Fleet register with image upload
- [ ] Fleet detail tabs load
- [ ] Equipment list/detail
- [ ] 401 redirects to `/auth`
- [ ] Admin routes still work (unchanged)

---

## Known Risks

1. **Git history may contain old secrets** — rotate JWT and DB passwords after first secure deploy
2. **Local file uploads** — not durable across container restarts; use object storage
3. **OTP in server logs** — unsuitable for production until email/SMS integrated
4. **No rate limiting** — auth endpoints vulnerable to brute force
5. **JWT in localStorage** — XSS risk; consider httpOnly strategy

---

## Remaining TODOs

| Priority | Task |
|----------|------|
| P1 | Remove `backend/.env` from git tracking; rotate secrets |
| P1 | Set production `COOKIE_SECURE=true` |
| P2 | Add Next.js `middleware.ts` for `/dashboard` routes |
| P2 | Integrate email/SMS for OTP |
| P2 | S3/GCS upload backend |
| P3 | Equipment MediaTab device upload |
| P3 | Rate limiting (Bucket4j or API gateway) |
| P3 | E2E tests for auth + fleet flows |
| P3 | Landing page emoji → Lucide (out of user-dashboard scope) |
