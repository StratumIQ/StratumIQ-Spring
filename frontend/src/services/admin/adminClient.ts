import { dashApi, toQueryString } from "@/lib/api/client";

export const adminApi = {
  kpis: () => dashApi("/admin/dashboard/kpis"),
  userGrowth: (days = 90) => dashApi(`/admin/dashboard/user-growth${toQueryString({ days })}`),
  fleetGrowth: (days = 90) => dashApi(`/admin/dashboard/fleet-growth${toQueryString({ days })}`),
  activityTimeline: (days = 30) => dashApi(`/admin/dashboard/activity-timeline${toQueryString({ days })}`),
  recentActivities: (limit = 20) => dashApi(`/admin/dashboard/recent-activities${toQueryString({ limit })}`),
  marketingHighlights: () => dashApi("/admin/dashboard/marketing-highlights"),

  listUsers: (params: Record<string, unknown> = {}) =>
    dashApi(`/admin/users${toQueryString(params)}`),
  getUser: (id: number) => dashApi(`/admin/users/${id}`),
  updateUser: (id: number, body: Record<string, unknown>) =>
    dashApi(`/admin/users/${id}`, { method: "PUT", body }),
  updateUserStatus: (id: number, status: string) =>
    dashApi(`/admin/users/${id}/status`, { method: "PATCH", body: { status } }),
  updateUserRole: (id: number, role: string) =>
    dashApi(`/admin/users/${id}/role`, { method: "PATCH", body: { role } }),
  resetPassword: (id: number) =>
    dashApi(`/admin/users/${id}/reset-password`, { method: "POST" }),

  listEquipment: (params: Record<string, unknown> = {}) =>
    dashApi(`/admin/fleet/equipment${toQueryString(params)}`),
  getEquipment: (id: number) => dashApi(`/admin/fleet/equipment/${id}`),
  fleetHealth: () => dashApi("/admin/fleet/health"),
  fleetActivity: (limit = 50) => dashApi(`/admin/fleet/activity${toQueryString({ limit })}`),

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
