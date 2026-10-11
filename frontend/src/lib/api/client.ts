/**
 * Unified API client — StratumIQ Dashboard
 * All dashboard API calls route through this module.
 */

import { API_URL } from "@/lib/constants";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "@/lib/auth/token";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiOptions<B = unknown> = {
  method?: HttpMethod;
  body?: B;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  /** internal: set when retrying after a token refresh, to prevent infinite loops */
  _skipAuthRetry?: boolean;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: Record<string, string>,
    public code?: string,
    public requestId?: string,
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

let refreshPromise: Promise<boolean> | null = null;

/** Refreshes the access token, deduping concurrent callers into a single in-flight request. */
function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const refreshToken = getRefreshToken();
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
        });
        if (!res.ok) return false;
        const data = await res.json().catch(() => null) as { accessToken?: string; refreshToken?: string } | null;
        if (!data?.accessToken) return false;
        setTokens(data.accessToken, data.refreshToken);
        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
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
    _skipAuthRetry = false,
  } = options;

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    credentials,
    headers: authHeaders(headers),
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && !_skipAuthRetry && endpoint !== "/auth/refresh") {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiClient<T, B>(endpoint, { ...options, _skipAuthRetry: true });
    }
    clearTokens();
    if (typeof window !== "undefined") {
      window.location.href = "/auth";
    }
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const err = data as {
      error?: string;
      code?: string;
      fields?: Record<string, string>;
      requestId?: string;
      errorId?: string;
    } | null;
    throw new ApiError(
      err?.error ?? "Something went wrong",
      res.status,
      err?.fields,
      err?.code,
      err?.requestId ?? err?.errorId ?? res.headers.get("X-Request-ID") ?? undefined,
    );
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
