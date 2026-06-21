import { apiClient } from "./client";
import type { RegisterPayload, OTPPayload, PhonePayload, LoginPayload, AuthResponse } from "@/types";
import type { DashUser } from "@/types";
import { getRefreshToken, setTokens, clearTokens } from "@/lib/auth/token";

function persistAuthResponse(data: AuthResponse): void {
  if (data.accessToken) {
    setTokens(data.accessToken, data.refreshToken);
  }
}

async function refreshSession(): Promise<AuthResponse> {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    const data = await apiClient<AuthResponse, { refreshToken: string }>("/auth/refresh", {
      method: "POST",
      body: { refreshToken },
    });
    persistAuthResponse(data);
    return data;
  }
  const data = await apiClient<AuthResponse>("/auth/refresh");
  persistAuthResponse(data);
  return data;
}

export const authApi = {
  register: (p: RegisterPayload) =>
    apiClient<AuthResponse, RegisterPayload>("/auth/register", { method: "POST", body: p }),

  verifyEmailOTP: (p: OTPPayload) =>
    apiClient<AuthResponse, OTPPayload>("/auth/verify-email-otp", { method: "POST", body: p }),

  sendPhoneOTP: (p: PhonePayload) =>
    apiClient<AuthResponse, PhonePayload>("/auth/send-phone-otp", { method: "POST", body: p }),

  verifyPhoneOTP: async (p: OTPPayload) => {
    const data = await apiClient<AuthResponse, OTPPayload>("/auth/verify-phone-otp", { method: "POST", body: p });
    persistAuthResponse(data);
    return data;
  },

  login: async (p: LoginPayload) => {
    const data = await apiClient<AuthResponse, LoginPayload>("/auth/login", { method: "POST", body: p });
    persistAuthResponse(data);
    return data;
  },

  refresh: () => refreshSession(),

  logout: () =>
    apiClient<{ message: string }>("/auth/logout", { method: "POST" }).finally(() => clearTokens()),

  profile: () => apiClient<{ user?: DashUser } & Partial<DashUser>>("/dashboard/profile"),
};

export { refreshSession };
