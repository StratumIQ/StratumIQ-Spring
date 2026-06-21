export type RegisterPayload = { firstName: string; lastName: string; email: string; password: string; phone: string };
export type OTPPayload      = { userId: number; otp: string };
export type PhonePayload    = { userId: number; phone: string };
export type LoginPayload    = { email: string; password: string };
export type AuthResponse    = { userId?: number; accessToken?: string; refreshToken?: string; message?: string };

export type DashUser = { id: number; firstName: string; lastName: string; email: string; role: string };

export type EquipmentStats  = { active: string; idle: string; in_maintenance: string; total: string; uptime_pct: string | null };
export type PartsStats      = { out_of_stock: string; low_stock: string; on_order: string; total: string };
export type MaintenanceStats= { overdue: string; in_progress: string; due_soon: string; total: string };
export type AlertStats      = { unread: string; critical_unread: string; total: string };
export type DashStats       = { equipment: EquipmentStats; parts: PartsStats; maintenance: MaintenanceStats; alerts: AlertStats };

export type AIAction   = { label: string; href: string; variant: string };
export type AIKPI      = { label: string; value: string | number; icon?: string };
export type AISummary  = { headline: string; body: string; status: "healthy" | "needs_attention" | "warning"; actions: AIAction[]; kpis: AIKPI[] };

export type NewsItem   = { id: number; badge: string; badgeColor: string; title: string; summary: string; date: string; category: string };
export type PredItem   = { id: number; name: string; model: string; riskScore: number; riskLevel: "critical" | "high" | "medium" | "low"; estimatedDays: number | null; overdueCount: number; dueSoonCount: number };
export type PerfMetric = { value: number; unit: string; label: string };
export type Production = { output: PerfMetric; energyUsage: PerfMetric; oee: PerfMetric; throughput: PerfMetric; benchmarks: { label: string; value: string }[] };

export type Alert = { id: number; title: string; message: string; type: "critical" | "warning" | "info" | "success"; is_read: boolean; created_at: string };