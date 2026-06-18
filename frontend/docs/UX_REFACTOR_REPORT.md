# StratumIQ User Dashboard UX/UI Refactor Report

Date: June 13, 2026  
Scope: User/Dealer dashboard, auth (`/auth`, `/auth/login`, `/auth/signup`), fleet & equipment modules  
Excluded: `/dashboard-admin/**` (unchanged)

---

## 1. UX Audit Summary

### Before
- Auth used dark theme inconsistent with dashboard light SaaS design system
- Fleet forms used manual image URL fields
- No centralized toast system on user dashboard
- Status badges and enums mismatched backend (`ACTIVE` vs `active`)
- Fleet save/update sent snake_case payloads to camelCase Spring Boot DTOs
- Hours update sent absolute totals; backend expects delta via `hoursLogged`
- Analytics used mock bar divs instead of real chart library
- Equipment media tab used emojis and browser `confirm()`

### After
- Unified light premium auth experience with step-by-step signup
- Drag-and-drop image upload with server-side storage
- Sonner toasts across dashboard and auth
- API transform layer for camelCase/snake_case compatibility
- Fixed enum casing across fleet detail, list, and forms
- Recharts analytics on fleet detail
- Lucide icons throughout; no browser alerts/confirms in touched modules

---

## 2. UI Improvements

| Area | Changes |
|------|---------|
| Auth | Split layout, glass card, illustration, progress steps, password strength, remember me |
| Dashboard layout | Sonner toaster, existing framer-motion route transitions retained |
| Fleet list | Toasts on status/delete; existing search/filter/sort/pagination/skeletons retained |
| Fleet forms | ImageUpload component replaces URL field |
| Fleet detail | Status select fixed; inline delete confirm; operation toasts |
| Analytics | Recharts area, bar, pie charts; KPI cards; responsive grid |
| Equipment media | Lucide type icons; Sonner notifications; two-step delete confirm |

---

## 3. Bug List Found & Fixes

| Bug | Root cause | Fix |
|-----|------------|-----|
| Fleet create/update fails silently on fields | Frontend sent `image_url`, backend expects `imageUrl` | `lib/api/transform.ts` + updated `fleet.ts` |
| Status change on detail page broken | Select used lowercase values | Options → `ACTIVE`, `IDLE`, etc. |
| Status badges wrong colors | `EQUIPMENT_STATUS_CONFIG` keys lowercase | Keys updated to UPPER_CASE |
| Hours update incorrect | Sent `running_hours` absolute; backend adds delta | `updateHours()` computes delta |
| Service records fail | Lowercase enum values | Forms use `PREVENTIVE`, `SCHEDULED`, etc. |
| Category badges blank | Lookup keys lowercase | Normalized to UPPER_CASE |
| Browser confirm on service delete | Legacy pattern | Inline confirm button |
| Image URL only | No upload path | `/api/upload` + `ImageUpload` component |

---

## 4. New Components

| Component | Path |
|-----------|------|
| `DashboardToaster` | `components/dashboard/layout/DashboardToaster.tsx` |
| `AuthToaster` | `components/auth/AuthToaster.tsx` |
| `AuthIllustration` | `components/auth/AuthIllustration.tsx` |
| `ImageUpload` | `components/dashboard/ui/ImageUpload.tsx` |
| API transforms | `lib/api/transform.ts` |
| Toast helper | `lib/toast.ts` |
| Upload API route | `app/api/upload/route.ts` |

---

## 5. Updated Routing Map

### Auth
- `/auth` — unified login + signup wizard
- `/auth/login` → redirect `/auth?mode=login`
- `/auth/signup` → redirect `/auth?mode=register`

### User Dashboard (unchanged paths, improved UI)
- `/dashboard` — home
- `/dashboard/fleet`, `/dashboard/fleet/new`, `/dashboard/fleet/[id]`, `/dashboard/fleet/[id]/edit`
- `/dashboard/equipment`, `/dashboard/equipment/new`, `/dashboard/equipment/[id]`, `/dashboard/equipment/[id]/edit`
- `/dashboard/maintenance`, `/dashboard/alerts`, `/dashboard/parts`, `/dashboard/configurator`, `/dashboard/solutions`, `/dashboard/settings`

### Admin (NOT modified)
- `/dashboard-admin/**`

---

## 6. Responsive Audit

- Auth: brand panel hidden below 900px; form full-width
- Analytics charts: 2-col → 1-col below 900px; KPI grid 4 → 2 cols
- Dashboard: existing mobile sidebar drawer retained
- Image upload: touch-friendly dropzone, preview actions stack on narrow screens

---

## 7. Accessibility Audit

- Password visibility toggles with `aria-label`
- Image upload keyboard accessible (Enter/Space activates)
- Form errors announced inline under fields
- Status selects have `aria-label`
- Lucide icons used decoratively with text labels
- No reliance on color-only status (badges include text + dot)

---

## 8. Dependency Map

```
Auth pages → authAPI (utils) → Spring /api/auth/*
Dashboard layout → QueryProvider, Sonner, Sidebar, TopBar
Fleet pages → useFleet hooks → fleetApi (transform layer) → Spring /api/fleet/*
Equipment pages → useEquipment → equipmentApi → Spring /api/equipment/*
ImageUpload → /api/upload (Next.js) → public/uploads/fleet/*
```

---

## 9. Remaining Recommendations (future)

- Migrate equipment module fully from custom `useToast` in EqUI to Sonner
- Add Spring Boot multipart upload endpoint for production CDN storage
- Extend ImageUpload to equipment MediaTab
- TanStack Query migration for fleet/equipment hooks (performance)
- Forgot-password backend endpoint when available
