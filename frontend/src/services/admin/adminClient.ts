import { dashApi, toQueryString } from "@/lib/api/client";

export const adminApi = {
  // ─── Dashboard ─────────────────────────────────────────────────────────────
  kpis: () => dashApi("/admin/dashboard/kpis"),
  userGrowth: (days = 90) => dashApi(`/admin/dashboard/user-growth${toQueryString({ days })}`),
  fleetGrowth: (days = 90) => dashApi(`/admin/dashboard/fleet-growth${toQueryString({ days })}`),
  activityTimeline: (days = 30) => dashApi(`/admin/dashboard/activity-timeline${toQueryString({ days })}`),
  recentActivities: (limit = 20) => dashApi(`/admin/dashboard/recent-activities${toQueryString({ limit })}`),
  marketingHighlights: () => dashApi("/admin/dashboard/marketing-highlights"),

  // ─── Activity ──────────────────────────────────────────────────────────────
  listActivities: (params: Record<string, unknown> = {}) =>
    dashApi(`/admin/activity${toQueryString(params)}`),
  activitySummary: (days = 30) =>
    dashApi(`/admin/activity/summary${toQueryString({ days })}`),

  // ─── Users ─────────────────────────────────────────────────────────────────
  listUsers: (params: Record<string, unknown> = {}) =>
    dashApi(`/admin/users${toQueryString(params)}`),
  getUser: (id: number) => dashApi(`/admin/users/${id}`),

  /** Admin manually creates a user. Returns { user, defaultPassword, message }. */
  createUser: (body: {
    firstName: string;
    lastName:  string;
    email:     string;
    phone?:    string;
  }) =>
    dashApi("/admin/users", { method: "POST", body }),

  updateUser: (id: number, body: Record<string, unknown>) =>
    dashApi(`/admin/users/${id}`, { method: "PUT", body }),
  updateUserStatus: (id: number, status: string) =>
    dashApi(`/admin/users/${id}/status`, { method: "PATCH", body: { status } }),
  updateUserRole: (id: number, role: string) =>
    dashApi(`/admin/users/${id}/role`, { method: "PATCH", body: { role } }),
  resetPassword: (id: number) =>
    dashApi(`/admin/users/${id}/reset-password`, { method: "POST" }),

  // ─── Fleet ─────────────────────────────────────────────────────────────────
  listEquipment: (params: Record<string, unknown> = {}) =>
    dashApi(`/admin/fleet/equipment${toQueryString(params)}`),
  getEquipment: (id: number) => dashApi(`/admin/fleet/equipment/${id}`),
  fleetHealth: () => dashApi("/admin/fleet/health"),
  fleetActivity: (limit = 50) => dashApi(`/admin/fleet/activity${toQueryString({ limit })}`),

  /** Admin adds equipment and assigns it directly to a user. */
  addEquipment: (body: {
    userId:       number;
    name:         string;
    serialNumber: string;
    make?:        string;
    model?:       string;
    year?:        string;
    category?:    string;
    status?:      string;
  }) =>
    dashApi("/admin/fleet/equipment", { method: "POST", body }),

  // ─── Support ───────────────────────────────────────────────────────────────
  listTickets: (params: Record<string, unknown> = {}) =>
    dashApi(`/admin/support/tickets${toQueryString(params)}`),
  getTicket: (id: number) => dashApi(`/admin/support/tickets/${id}`),
  createTicket: (body: Record<string, unknown>) =>
    dashApi("/admin/support/tickets", { method: "POST", body }),
  assignTicket: (id: number, assignedTo: number) =>
    dashApi(`/admin/support/tickets/${id}/assign`, { method: "PATCH", body: { assignedTo } }),
  updateTicketStatus: (id: number, status: string) =>
    dashApi(`/admin/support/tickets/${id}/status`, { method: "PATCH", body: { status } }),
  addTicketNote: (id: number, body: { body: string; isInternal?: boolean }) =>
    dashApi(`/admin/support/tickets/${id}/notes`, { method: "POST", body }),
};