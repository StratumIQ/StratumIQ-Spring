/**
 * Client-side token storage for cross-origin deployments (Vercel frontend + Railway API).
 * sessionStorage limits exposure to the tab lifetime; cookies remain a same-origin fallback.
 */

const ACCESS_KEY = "stratumiq_access_token";
const REFRESH_KEY = "stratumiq_refresh_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(REFRESH_KEY);
}

export function setTokens(accessToken: string, refreshToken?: string | null): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ACCESS_KEY, accessToken);
  if (refreshToken) {
    sessionStorage.setItem(REFRESH_KEY, refreshToken);
  }
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ACCESS_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
}
