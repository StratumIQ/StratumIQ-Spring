import { API_URL } from "./constants";
import type { RegisterPayload, OTPPayload, PhonePayload, LoginPayload, AuthResponse } from "@/types";

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
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
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
    headers: { "Content-Type": "application/json", ...headers },
    body:    body ? JSON.stringify(body) : undefined,
  });
  let data: unknown;
  try   { data = await res.json(); }
  catch { data = null; }
  if (!res.ok) { const e = data as { error?: string } | null; throw new Error(e?.error ?? "Something went wrong"); }
  return data as T;
}

export function dashFetch<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const token = getToken();
  return apiFetch<T>(endpoint, { ...options, headers: { Authorization: `Bearer ${token}`, ...options.headers } });
}

export const authAPI = {
  register:       (p: RegisterPayload) => apiFetch<AuthResponse, RegisterPayload>("/auth/register", { method: "POST", body: p }),
  verifyEmailOTP: (p: OTPPayload)      => apiFetch<AuthResponse, OTPPayload>("/auth/verify-email-otp", { method: "POST", body: p }),
  sendPhoneOTP:   (p: PhonePayload)    => apiFetch<AuthResponse, PhonePayload>("/auth/send-phone-otp", { method: "POST", body: p }),
  verifyPhoneOTP: (p: OTPPayload)      => apiFetch<AuthResponse, OTPPayload>("/auth/verify-phone-otp", { method: "POST", body: p }),
  login:          (p: LoginPayload)    => apiFetch<AuthResponse, LoginPayload>("/auth/login", { method: "POST", body: p }),
  refresh:        ()                   => apiFetch<AuthResponse>("/auth/refresh"),
  logout:         ()                   => apiFetch<{ message: string }>("/auth/logout", { method: "POST" }),
};