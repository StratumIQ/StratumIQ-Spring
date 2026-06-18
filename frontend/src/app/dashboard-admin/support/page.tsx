"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/services/admin/adminClient";
import type { AdminTicket } from "@/types/admin";

const STATUS_CLASS: Record<string, string> = {
  OPEN: "admin-badge-open",
  ASSIGNED: "admin-badge-open",
  IN_PROGRESS: "admin-badge-active",
  WAITING_CUSTOMER: "admin-badge-banned",
  RESOLVED: "admin-badge-resolved",
};

export default function AdminSupportPage() {
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<{ tickets: AdminTicket[]; pagination: { totalPages: number } }>({
    queryKey: ["admin", "tickets", status, search, page],
    queryFn: () => adminApi.listTickets({ status, search, page, limit: 20 }) as Promise<{ tickets: AdminTicket[]; pagination: { totalPages: number } }>,
  });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Support Center</h2>
        <p style={{ color: "#94a3b8", fontSize: 14 }}>Manage and resolve customer support tickets</p>
      </div>

      <div className="admin-glass" style={{ padding: 16, marginBottom: 16, display: "flex", gap: 12 }}>
        <input className="admin-input" placeholder="Search tickets…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <select className="admin-input" style={{ width: 180 }} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="all">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="WAITING_CUSTOMER">Waiting Customer</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      <div className="admin-glass admin-table-wrap">
        {isLoading ? (
          <div style={{ padding: 24 }}><div className="admin-skeleton" style={{ height: 200 }} /></div>
        ) : (data?.tickets ?? []).length === 0 ? (
          <div className="admin-empty">No tickets found</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Subject</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Priority</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data?.tickets.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{t.ticketNumber}</td>
                  <td style={{ fontWeight: 600 }}>{t.subject}</td>
                  <td style={{ color: "#94a3b8" }}>{t.customerName || t.customerEmail}</td>
                  <td><span className={`admin-badge ${STATUS_CLASS[t.status] ?? "admin-badge-open"}`}>{t.status}</span></td>
                  <td>{t.priority}</td>
                  <td>
                    <Link href={`/dashboard-admin/support/${t.id}`} className="admin-btn admin-btn-ghost" style={{ textDecoration: "none", padding: "6px 12px" }}>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
