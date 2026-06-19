import { apiClient } from "./client";
import type { RegisterPayload, OTPPayload, PhonePayload, LoginPayload, AuthResponse } from "@/types";
import type { DashUser } from "@/types";

export const authApi = {
  register: (p: RegisterPayload) =>
    apiClient<AuthResponse, RegisterPayload>("/auth/register", { method: "POST", body: p }),

  verifyEmailOTP: (p: OTPPayload) =>
    apiClient<AuthResponse, OTPPayload>("/auth/verify-email-otp", { method: "POST", body: p }),

  sendPhoneOTP: (p: PhonePayload) =>
    apiClient<AuthResponse, PhonePayload>("/auth/send-phone-otp", { method: "POST", body: p }),

  verifyPhoneOTP: (p: OTPPayload) =>
    apiClient<AuthResponse, OTPPayload>("/auth/verify-phone-otp", { method: "POST", body: p }),

  login: (p: LoginPayload) =>
    apiClient<AuthResponse, LoginPayload>("/auth/login", { method: "POST", body: p }),

  refresh: () => apiClient<AuthResponse>("/auth/refresh"),

  logout: () => apiClient<{ message: string }>("/auth/logout", { method: "POST" }),

  profile: () => apiClient<{ user?: DashUser } & Partial<DashUser>>("/dashboard/profile"),
};
