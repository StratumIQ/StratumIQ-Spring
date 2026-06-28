// ─── Auth ──────────────────────────────────────────────────────────────────────
export type RegisterPayload = { firstName: string; lastName: string; email: string; password: string; phone: string };
export type OTPPayload      = { userId: number; otp: string };
export type PhonePayload    = { userId: number; phone: string };
export type LoginPayload    = { email: string; password: string };
export type AuthResponse    = { userId?: number; accessToken?: string; refreshToken?: string; message?: string };

// ─── Dashboard user ────────────────────────────────────────────────────────────
export type DashUser = { id: number; firstName: string; lastName: string; email: string; role: string };

// ─── Dashboard stats ───────────────────────────────────────────────────────────
export type EquipmentStats   = { active: string; idle: string; in_maintenance: string; total: string; uptime_pct: string | null };
export type PartsStats       = { out_of_stock: string; low_stock: string; on_order: string; total: string };
export type MaintenanceStats = { overdue: string; in_progress: string; due_soon: string; total: string };
export type AlertStats       = { unread: string; critical_unread: string; total: string };
export type DashStats        = { equipment: EquipmentStats; parts: PartsStats; maintenance: MaintenanceStats; alerts: AlertStats };

// ─── AI / news / production ────────────────────────────────────────────────────
export type AIAction   = { label: string; href: string; variant: string };
export type AIKPI      = { label: string; value: string | number; icon?: string };
export type AISummary  = { headline: string; body: string; status: "healthy" | "needs_attention" | "warning"; actions: AIAction[]; kpis: AIKPI[] };
export type NewsItem   = { id: number; badge: string; badgeColor: string; title: string; summary: string; date: string; category: string };
export type PredItem   = { id: number; name: string; model: string; riskScore: number; riskLevel: "critical" | "high" | "medium" | "low"; estimatedDays: number | null; overdueCount: number; dueSoonCount: number };
export type PerfMetric = { value: number; unit: string; label: string };
export type Production = { output: PerfMetric; energyUsage: PerfMetric; oee: PerfMetric; throughput: PerfMetric; benchmarks: { label: string; value: string }[] };
export type Alert      = { id: number; title: string; message: string; type: "critical" | "warning" | "info" | "success"; is_read: boolean; created_at: string };

// ─── Admin pagination ──────────────────────────────────────────────────────────
export type Pagination = {
  page:       number;
  limit:      number;
  total:      number;
  totalPages: number;
};

// ─── Admin — Users ─────────────────────────────────────────────────────────────
export type AdminUser = {
  id:          number;
  firstName:   string;
  lastName:    string;
  email:       string;
  phone:       string | null;
  role:        string;
  status:      string;
  tenantId:    number | null;
  createdAt:   string;
  lastLoginAt: string | null;
};

export type PaginatedUsers = {
  users:      AdminUser[];
  pagination: Pagination;
};

/** Response from POST /admin/users (admin creates user) */
export type CreateUserResponse = {
  user:            AdminUser;
  defaultPassword: string;
  message:         string;
};

// ─── Admin — Fleet / Equipment ─────────────────────────────────────────────────
export type AdminEquipment = {
  id:           number;
  name:         string;
  serialNumber: string;
  make:         string | null;
  model:        string | null;
  year:         string | null;
  category:     string | null;
  status:       string;
  userId:       number;
  tenantId:     number | null;
  createdAt:    string;
};

export type PaginatedEquipment = {
  equipment:  AdminEquipment[];
  pagination: Pagination;
};

// ─── Admin — Support tickets ───────────────────────────────────────────────────
export type AdminTicketNote = {
  id:         number;
  ticketId:   number;
  authorId:   number;
  body:       string;
  isInternal: boolean;
  createdAt:  string;
};

export type AdminTicket = {
  id:           number;
  ticketNumber: string;
  userId:       number;
  tenantId:     number | null;
  subject:      string;
  description:  string | null;
  status:       string;
  priority:     string;
  assignedTo:   number | null;
  createdBy:    number | null;
  resolvedAt:   string | null;
  createdAt:    string;
  notes:        AdminTicketNote[];
};

export type PaginatedTickets = {
  tickets:    AdminTicket[];
  pagination: Pagination;
};

// ─── Admin — Activity ──────────────────────────────────────────────────────────
export type AdminActivity = {
  id:         number;
  action:     string;
  entityType: string;
  entityId:   number;
  userId:     number | null;
  actorId:    number | null;
  createdAt:  string;
};

export type PaginatedActivities = {
  activities: AdminActivity[];
  pagination: Pagination;
};