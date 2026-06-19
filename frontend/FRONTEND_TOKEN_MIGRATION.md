# Frontend Token Migration Plan

Date: 2026-06-19

## Overview
Migrate from storing access tokens in `localStorage` to relying on secure **httpOnly cookies** set by the backend. This eliminates XSS token theft attacks while maintaining CORS authentication.

## Current Architecture (Insecure)
- **Access Token:** Stored in `localStorage` under key `"token"`
- **Refresh Token:** Set as a cookie by backend (more secure)
- **Problem:** Access token in `localStorage` is vulnerable to XSS; can be read by malicious JS

## New Architecture (Secure)
- **Access Token:** Set as httpOnly, Secure, SameSite cookie by backend (`accessToken` or `Authorization: Bearer` via cookie)
- **Refresh Token:** Already httpOnly cookie (no change)
- **Frontend:** Removes all manual token storage/retrieval; relies on `credentials: 'include'` for automatic cookie transmission

## Files to Modify

### 1. `frontend/src/lib/utils.ts`
**Changes:**
- Remove `TOKEN_KEY` constant
- Update `getToken()` → Return `null` (token no longer stored client-side)
- Update `setToken()` → No-op (token is in httpOnly cookie)
- Update `removeToken()` → No-op (cookies cleared on logout)
- Update `dashFetch()` → Remove manual Authorization header injection; rely on cookies

**Rationale:** Tokens are now managed by browser cookies automatically.

### 2. `frontend/src/app/auth/page.tsx`
**Changes:**
- In `doLogin()`: Remove `localStorage.setItem("token", r.accessToken)`
- In `doVerifyPhone()`: Remove `localStorage.setItem("token", r.accessToken)`
- In both functions: Replace manual `Authorization: Bearer` header with `credentials: 'include'`
- Fetch profile using standard `apiFetch()` (which includes credentials)

**Rationale:** No need to store token; cookies are automatic.

### 3. `frontend/src/app/dashboard/layout.tsx`
**Changes:**
- In refresh token handler: Stop trying to store `r.accessToken`
- Keep refresh token refresh logic (browser handles cookie updates)
- Use standard `apiFetch()` for protected routes

**Rationale:** Access token refresh is handled by backend; only set cookies.

### 4. `frontend/src/app/dashboard-admin/layout.tsx`
**Changes:**
- Same as dashboard/layout.tsx

**Rationale:** Consistent behavior across admin and user dashboards.

### 5. `frontend/src/lib/api/client.ts`
**Changes:**
- Update to use `credentials: 'include'` by default
- Remove manual token injection from headers

**Rationale:** Cookies are automatically sent by browser.

### 6. `frontend/src/components/dashboard/ui/ImageUpload.tsx`
**Changes:**
- Remove `getToken()` call
- Replace `Authorization: Bearer` header with automatic cookie transmission

**Rationale:** Use standard fetch with credentials instead.

## Backend Changes Required (Already Applied)
- ✅ Access token stored in **httpOnly, Secure, SameSite** cookie
- ✅ Refresh token remains in httpOnly cookie
- ✅ Routes return tokens in response JSON (deprecated) OR cookies only (new)
- ✅ CORS configured to allow credentials

## Migration Testing Checklist
- [ ] Login flow works without storing token in localStorage
- [ ] Token refresh works with cookies
- [ ] Logout clears cookies
- [ ] API requests include cookies automatically
- [ ] XSS payload cannot read tokens from localStorage
- [ ] Rate limiting still works (per-IP, per-user)
- [ ] Admin features still work
- [ ] File uploads include auth cookies

## Rollback Plan
- Keep localStorage token code commented for quick rollback
- All changes are isolated to auth/token handling layers
- No structural changes to API contracts

## Security Improvements
- ✅ Access tokens no longer exposed to XSS
- ✅ Tokens cannot be read by `document.cookie` (httpOnly)
- ✅ Tokens only sent over HTTPS in prod (Secure flag)
- ✅ Tokens only sent to same-origin requests (SameSite)
- ✅ Reduces attack surface by 1 major vector
