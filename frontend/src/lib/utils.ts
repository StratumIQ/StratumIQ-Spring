import { API_URL } from "./constants";
import type { RegisterPayload, OTPPayload, PhonePayload, LoginPayload, AuthResponse } from "@/types";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "@/lib/auth/token";

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function safeInt(v: string | null | undefined): number {
  const n = parseInt(v ?? "0");
  return isNaN(n) ? 0 : n;
}

export function safeFloat(v: string | null | undefined): number {
  const n = parseFloat(v ?? "0");
  return isNaN(n) ? 0 : n;
}

export function getToken(): string | null {
  return getAccessToken();
}

export function setToken(token: string): void {
  setTokens(token);
}

export function removeToken(): void {
  clearTokens();
}

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  const token = getAccessToken();
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function persistAuthResponse(data: AuthResponse): void {
  if (data.accessToken) {
    setTokens(data.accessToken, data.refreshToken);
  }
}

export function riskColor(level: string): string {
  const map: Record<string, string> = {
    critical: "#DC2626",
    high:     "#D97706",
    medium:   "#CA8A04",
    low:      "#16A34A",
  };
  return map[level] ?? "#9CA3AF";
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type ApiOptions<B = unknown> = { method?: HttpMethod; body?: B; headers?: Record<string, string>; credentials?: RequestCredentials };

export async function apiFetch<T = unknown, B = unknown>(endpoint: string, options: ApiOptions<B> = {}): Promise<T> {
  const { method = "GET", body, headers = {}, credentials = "include" } = options;
  const res = await fetch(`${API_URL}${endpoint}`, {
    method, credentials,
    headers: authHeaders({ "Content-Type": "application/json", ...headers }),
    body:    body ? JSON.stringify(body) : undefined,
  });
  let data: unknown;
  try   { data = await res.json(); }
  catch { data = null; }
  if (!res.ok) { const e = data as { error?: string } | null; throw new Error(e?.error ?? "Something went wrong"); }
  return data as T;
}

export function dashFetch<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  return apiFetch<T>(endpoint, { ...options });
}

async function authFetch<T = unknown, B = unknown>(
  endpoint: string,
  options: ApiOptions<B> = {},
): Promise<T> {
  const data = await apiFetch<T, B>(endpoint, options);
  persistAuthResponse(data as AuthResponse);
  return data;
}

async function refreshSession(): Promise<AuthResponse> {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    return authFetch<AuthResponse, { refreshToken: string }>("/auth/refresh", {
      method: "POST",
      body: { refreshToken },
    });
  }
  return authFetch<AuthResponse>("/auth/refresh");
}

export const authAPI = {
  register:       (p: RegisterPayload) => apiFetch<AuthResponse, RegisterPayload>("/auth/register", { method: "POST", body: p }),
  verifyEmailOTP: (p: OTPPayload)      => apiFetch<AuthResponse, OTPPayload>("/auth/verify-email-otp", { method: "POST", body: p }),
  sendPhoneOTP:   (p: PhonePayload)    => apiFetch<AuthResponse, PhonePayload>("/auth/send-phone-otp", { method: "POST", body: p }),
  verifyPhoneOTP: (p: OTPPayload)      => authFetch<AuthResponse, OTPPayload>("/auth/verify-phone-otp", { method: "POST", body: p }),
  login:          (p: LoginPayload)    => authFetch<AuthResponse, LoginPayload>("/auth/login", { method: "POST", body: p }),
  refresh:        ()                   => refreshSession(),
  logout:         ()                   => apiFetch<{ message: string }>("/auth/logout", { method: "POST" }).finally(() => clearTokens()),
};