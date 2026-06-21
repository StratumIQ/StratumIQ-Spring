/**
 * Unified API client — StratumIQ Dashboard
 * All dashboard API calls route through this module.
 */

import { API_URL } from "@/lib/constants";
import { getAccessToken } from "@/lib/auth/token";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiOptions<B = unknown> = {
  method?: HttpMethod;
  body?: B;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function toQueryString(params: Record<string, unknown>): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== "" && v !== null,
  );
  if (!entries.length) return "";
  return "?" + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

function authHeaders(headers: Record<string, string>): Record<string, string> {
  const merged: Record<string, string> = { "Content-Type": "application/json", ...headers };
  const token = getAccessToken();
  if (token && !merged.Authorization) {
    merged.Authorization = `Bearer ${token}`;
  }
  return merged;
}

export async function apiClient<T = unknown, B = unknown>(
  endpoint: string,
  options: ApiOptions<B> = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    headers = {},
    credentials = "include",
  } = options;

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    credentials,
    headers: authHeaders(headers),
    body: body ? JSON.stringify(body) : undefined,
  });

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const err = data as { error?: string } | null;
    throw new ApiError(err?.error ?? "Something went wrong", res.status);
  }

  return data as T;
}

/** Authenticated dashboard request */
export function dashApi<T = unknown, B = unknown>(
  endpoint: string,
  options: ApiOptions<B> = {},
): Promise<T> {
  return apiClient<T, B>(endpoint, options);
}
