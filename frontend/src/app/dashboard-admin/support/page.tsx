"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, CheckCircle2, CheckSquare, Clock3, Inbox, MessageSquareText, Search, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/services/admin/adminClient";
import type { AdminTicket } from "@/types/admin";

const STATUS_META: Record<string, { label: string; className: string }> = {
  OPEN: { label: "Open", className: "admin-badge-open" },
  ASSIGNED: { label: "Assigned", className: "admin-badge-open" },
  IN_PROGRESS: { label: "In progress", className: "admin-badge-active" },
  WAITING_CUSTOMER: { label: "Waiting customer", className: "admin-badge-banned" },
  RESOLVED: { label: "Resolved", className: "admin-badge-resolved" },
};

const PRIORITY_META: Record<string, { label: string; className: string }> = {
  LOW: { label: "Low", className: "admin-badge-resolved" },
  MEDIUM: { label: "Medium", className: "admin-badge-pending" },
  HIGH: { label: "High", className: "admin-badge-banned" },
};

const KPI_CONFIG = [
  { key: "open", label: "Open", icon: Inbox },
  { key: "assigned", label: "Assigned", icon: UserCheck },
  { key: "waiting", label: "Waiting", icon: Clock3 },
  { key: "resolved", label: "Resolved", icon: CheckCircle2 },
  { key: "closed", label: "Closed", icon: Archive },
] as const;

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminSupportPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [bulkStatus, setBulkStatus] = useState("ASSIGNED");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page] = useState(1);

  const { data, isLoading } = useQuery<{ tickets: AdminTicket[]; pagination: { totalPages: number } }>({
    queryKey: ["admin", "tickets", status, search, page],
    queryFn: () => adminApi.listTickets({ status, search, page, limit: 20 }) as Promise<{ tickets: AdminTicket[]; pagination: { totalPages: number } }>,
  });

  const tickets = data?.tickets ?? [];
  const summary = useMemo(() => ({
    open: tickets.filter((ticket) => ticket.status !== "RESOLVED").length,
    assigned: tickets.filter((ticket) => ticket.status === "ASSIGNED" || ticket.status === "IN_PROGRESS").length,
    waiting: tickets.filter((ticket) => ticket.status === "WAITING_CUSTOMER").length,
    resolved: tickets.filter((ticket) => ticket.status === "RESOLVED").length,
    closed: tickets.filter((ticket) => ticket.status === "RESOLVED").length,
  }), [tickets]);

  const statusMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: number; nextStatus: string }) => adminApi.updateTicketStatus(id, nextStatus),
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["admin", "tickets"] });
      qc.invalidateQueries({ queryKey: ["admin", "ticket"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, ownerId }: { id: number; ownerId: number }) => adminApi.assignTicket(id, ownerId),
    onSuccess: () => {
      toast.success("Ticket assigned");
      qc.invalidateQueries({ queryKey: ["admin", "tickets"] });
      qc.invalidateQueries({ queryKey: ["admin", "ticket"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const bulkMutation = useMutation({
    mutationFn: async (nextStatus: string) => {
      await Promise.all(selectedIds.map((id) => adminApi.updateTicketStatus(id, nextStatus)));
      return selectedIds.length;
    },
    onSuccess: (count) => {
      toast.success(`${count} ticket${count > 1 ? "s" : ""} updated`);
      setSelectedIds([]);
      qc.invalidateQueries({ queryKey: ["admin", "tickets"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const toggleSelection = (id: number) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));
  };

  return (
    <div>
      <div className="admin-support-kpi-row" style={{ marginBottom: 16 }}>
        {KPI_CONFIG.map((item) => {
          const Icon = item.icon;
          const value = summary[item.key as keyof typeof summary];
          return (
            <div key={item.key} className="admin-glass admin-support-kpi-card">
              <Icon size={16} />
              <strong>{value}</strong>
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>

      <div className="admin-glass" style={{ padding: 16, marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div className="admin-support-search" style={{ flex: 1, minWidth: 260 }}>
          <Search size={14} />
          <input
            placeholder="Search ticket, customer, or subject…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="admin-input" style={{ width: 200 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="WAITING_CUSTOMER">Waiting customer</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {selectedIds.length > 0 ? (
        <div className="admin-glass" style={{ padding: 12, marginBottom: 12, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{selectedIds.length} selected</span>
          <select className="admin-input" style={{ width: 170 }} value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}>
            <option value="ASSIGNED">Assign</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="WAITING_CUSTOMER">Waiting customer</option>
            <option value="RESOLVED">Resolved</option>
          </select>
          <button className="admin-btn admin-btn-primary" onClick={() => bulkMutation.mutate(bulkStatus)} disabled={bulkMutation.isPending}>
            Apply status
          </button>
        </div>
      ) : null}

      <div className="admin-support-list">
        {isLoading ? (
          <div className="admin-glass" style={{ padding: 24 }}>
            <div className="admin-skeleton" style={{ height: 220 }} />
          </div>
        ) : tickets.length === 0 ? (
          <div className="admin-glass admin-empty" style={{ padding: 32 }}>No tickets found for the current filter.</div>
        ) : (
          tickets.map((ticket) => {
            const statusMeta = STATUS_META[ticket.status] ?? STATUS_META.OPEN;
            const priorityMeta = PRIORITY_META[ticket.priority] ?? PRIORITY_META.MEDIUM;
            const selected = selectedIds.includes(ticket.id);
            return (
              <div key={ticket.id} className="admin-glass admin-support-row">
                <div className="admin-support-row-main">
                  <label className="admin-support-checkbox">
                    <input type="checkbox" checked={selected} onChange={() => toggleSelection(ticket.id)} />
                  </label>
                  <div style={{ minWidth: 0 }}>
                    <div className="admin-support-ticket-number">{ticket.ticketNumber}</div>
                    <div className="admin-support-row-title">{ticket.subject}</div>
                    <div className="admin-support-row-meta">
                      <span>{ticket.customerName || ticket.customerEmail || "Unknown customer"}</span>
                      <span>{formatDate(ticket.createdAt)}</span>
                      <span>{ticket.notes?.length ? `${ticket.notes.length} notes` : "No notes yet"}</span>
                    </div>
                  </div>
                </div>
                <div className="admin-support-row-side">
                  <div className="admin-support-row-badges">
                    <span className={`admin-badge ${priorityMeta.className}`}>{priorityMeta.label}</span>
                    <span className={`admin-badge ${statusMeta.className}`}>{statusMeta.label}</span>
                  </div>
                  <div className="admin-support-row-meta admin-support-row-meta--compact">
                    <span>Updated {formatDate(ticket.updatedAt)}</span>
                    <span>Assigned to {ticket.assigneeName || "Unassigned"}</span>
                  </div>
                  <div className="admin-support-row-actions">
                    <Link href={`/dashboard-admin/support/${ticket.id}`} className="admin-btn admin-btn-ghost" style={{ textDecoration: "none" }}>
                      View
                    </Link>
                    <button className="admin-btn admin-btn-ghost" onClick={() => assignMutation.mutate({ id: ticket.id, ownerId: ticket.userId })} disabled={assignMutation.isPending}>
                      Assign
                    </button>
                    <select className="admin-input" value={ticket.status} onChange={(e) => statusMutation.mutate({ id: ticket.id, nextStatus: e.target.value })} style={{ width: 140 }}>
                      <option value="OPEN">Open</option>
                      <option value="ASSIGNED">Assigned</option>
                      <option value="IN_PROGRESS">In progress</option>
                      <option value="WAITING_CUSTOMER">Waiting customer</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
