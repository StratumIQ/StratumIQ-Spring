export type AdminKpis = {
  totalUsers: number;
  activeUsersToday: number;
  newRegistrations: number;
  totalFleets: number;
  totalEquipment: number;
  openSupportTickets: number;
  mostActiveCustomers: Array<{
    userId: number;
    name: string;
    email: string;
    equipmentCount: number;
  }>;
};

export type ChartSeries = { series: Array<{ date: string; count: number }> };

export type AdminUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  tenantId: number | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

export type PaginatedUsers = {
  users: AdminUser[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export type AdminEquipment = {
  id: number;
  ownerId: number;
  ownerName: string;
  ownerEmail: string;
  name: string;
  category: string | null;
  serialNumber: string | null;
  brand: string | null;
  model: string | null;
  status: string;
  runningHours: number;
  location: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminTicket = {
  id: number;
  ticketNumber: string;
  userId: number;
  customerEmail: string | null;
  customerName: string | null;
  subject: string;
  description: string | null;
  status: string;
  priority: string;
  assignedTo: number | null;
  assigneeName: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  notes: Array<{
    id: number;
    body: string;
    isInternal: boolean;
    authorName: string;
    createdAt: string;
  }>;
};
