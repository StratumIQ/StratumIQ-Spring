"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/services/admin/adminClient";
import type { AdminEquipment } from "@/types/admin";

export default function AdminFleetPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const { data: health } = useQuery<{ totalEquipment: number; statusBreakdown: Record<string, number>; maintenanceCount: number }>({
    queryKey: ["admin", "fleet-health"],
    queryFn: () => adminApi.fleetHealth() as Promise<{ totalEquipment: number; statusBreakdown: Record<string, number>; maintenanceCount: number }>,
  });

  const { data, isLoading } = useQuery<{ equipment: AdminEquipment[]; pagination: { page: number; totalPages: number } }>({
    queryKey: ["admin", "fleet", search, status, page],
    queryFn: () => adminApi.listEquipment({ search, status, page, limit: 20 }) as Promise<{ equipment: AdminEquipment[]; pagination: { page: number; totalPages: number } }>,
  });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Fleet Monitoring</h2>
        <p style={{ color: "#94a3b8", fontSize: 14 }}>Read-only view of all platform equipment</p>
      </div>

      <div className="admin-kpi-grid" style={{ marginBottom: 24 }}>
        <div className="admin-glass admin-kpi">
          <div className="admin-kpi-label">Total Equipment</div>
          <div className="admin-kpi-value">{health?.totalEquipment ?? 0}</div>
        </div>
        <div className="admin-glass admin-kpi">
          <div className="admin-kpi-label">In Maintenance</div>
          <div className="admin-kpi-value">{health?.maintenanceCount ?? 0}</div>
        </div>
        {health?.statusBreakdown && Object.entries(health.statusBreakdown).map(([s, c]) => (
          <div key={s} className="admin-glass admin-kpi">
            <div className="admin-kpi-label">{s}</div>
            <div className="admin-kpi-value">{c}</div>
          </div>
        ))}
      </div>

      <div className="admin-glass" style={{ padding: 16, marginBottom: 16, display: "flex", gap: 12 }}>
        <input className="admin-input" placeholder="Search equipment…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <select className="admin-input" style={{ width: 160 }} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="all">All status</option>
          <option value="ACTIVE">Active</option>
          <option value="IDLE">Idle</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="RETIRED">Retired</option>
        </select>
      </div>

      <div className="admin-glass admin-table-wrap">
        {isLoading ? (
          <div style={{ padding: 24 }}><div className="admin-skeleton" style={{ height: 200 }} /></div>
        ) : (data?.equipment ?? []).length === 0 ? (
          <div className="admin-empty">No equipment found</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Hours</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data?.equipment.map((eq) => (
                <tr key={eq.id}>
                  <td style={{ fontWeight: 600 }}>{eq.name}</td>
                  <td style={{ color: "#94a3b8" }}>{eq.ownerName}<br /><span style={{ fontSize: 11 }}>{eq.ownerEmail}</span></td>
                  <td><span className="admin-badge admin-badge-active">{eq.status}</span></td>
                  <td>{eq.runningHours}</td>
                  <td>
                    <Link href={`/dashboard-admin/fleet/${eq.id}`} className="admin-btn admin-btn-ghost" style={{ textDecoration: "none", padding: "6px 12px" }}>View</Link>
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
