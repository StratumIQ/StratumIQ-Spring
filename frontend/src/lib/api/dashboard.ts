import { dashApi } from "./client";
import type { AISummary, Alert, NewsItem, PredItem } from "@/types";

export interface DashboardStats {
  totalEquipment: number;
  activeEquipment: number;
  maintenanceEquipment: number;
  idleEquipment: number;
}

export type ActivityItem = {
  action: string;
  entity: string;
  entity_id: number;
  metadata: Record<string, string>;
  created_at: string;
};

export const dashboardApi = {
  stats: () => dashApi<DashboardStats>("/dashboard/stats"),

  aiSummary: () => dashApi<AISummary>("/dashboard/ai-summary"),

  activity: () => dashApi<ActivityItem[]>("/dashboard/activity"),

  alerts: () => dashApi<Alert[] | { alerts: Alert[] }>("/dashboard/alerts"),

  predictive: () => dashApi<PredItem[]>("/dashboard/predictive"),

  news: () => dashApi<NewsItem[]>("/dashboard/news"),

  seedDemo: () => dashApi<{ ok: boolean }>("/dashboard/seed-demo", { method: "POST" }),

  markAlertsRead: () =>
    dashApi<void>("/dashboard/alerts/read-all", { method: "PATCH" }),
};

/** Normalize alerts response — backend may return array or { alerts } */
export function normalizeAlerts(data: Alert[] | { alerts: Alert[] }): Alert[] {
  if (Array.isArray(data)) return data;
  return data.alerts ?? [];
}
