"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, Activity, Truck, Headphones, TrendingUp, UserPlus } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { adminApi } from "@/services/admin/adminClient";
import type { AdminKpis, ChartSeries } from "@/types/admin";

function KpiCard({ label, value, icon: Icon }: { label: string; value: number | string; icon: React.ElementType }) {
  return (
    <div className="admin-glass admin-kpi">
      <div className="admin-kpi-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Icon size={14} style={{ color: "#E8692C" }} /> {label}
      </div>
      <div className="admin-kpi-value">{value}</div>
    </div>
  );
}

function ChartCard({ title, data, loading }: { title: string; data: ChartSeries | undefined; loading: boolean }) {
  if (loading) {
    return (
      <div className="admin-glass" style={{ padding: 20, minHeight: 280 }}>
        <div className="admin-skeleton" style={{ height: 20, width: 140, marginBottom: 16 }} />
        <div className="admin-skeleton" style={{ height: 200 }} />
      </div>
    );
  }

  const series = data?.series ?? [];

  return (
    <div className="admin-glass" style={{ padding: 20 }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>{title}</h3>
      {series.length === 0 ? (
        <div className="admin-empty" style={{ padding: 32 }}>No data yet</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} allowDecimals={false} />
            <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
            <Line type="monotone" dataKey="count" stroke="#E8692C" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data: kpis, isLoading: kpisLoading } = useQuery<AdminKpis>({
    queryKey: ["admin", "kpis"],
    queryFn: () => adminApi.kpis() as Promise<AdminKpis>,
  });

  const { data: userGrowth, isLoading: ugLoading } = useQuery<ChartSeries>({
    queryKey: ["admin", "user-growth"],
    queryFn: () => adminApi.userGrowth(90) as Promise<ChartSeries>,
  });

  const { data: fleetGrowth, isLoading: fgLoading } = useQuery<ChartSeries>({
    queryKey: ["admin", "fleet-growth"],
    queryFn: () => adminApi.fleetGrowth(90) as Promise<ChartSeries>,
  });

  const { data: recent, isLoading: recentLoading } = useQuery<{ activities: Array<{ action: string; entityType: string; createdAt: string }> }>({
    queryKey: ["admin", "recent"],
    queryFn: () => adminApi.recentActivities(10) as Promise<{ activities: Array<{ action: string; entityType: string; createdAt: string }> }>,
  });

  const { data: highlights } = useQuery<{ highlights: Array<{ title: string; type: string; summary: string }> }>({
    queryKey: ["admin", "highlights"],
    queryFn: () => adminApi.marketingHighlights() as Promise<{ highlights: Array<{ title: string; type: string; summary: string }> }>,
  });

  if (kpisLoading) {
    return (
      <div className="admin-kpi-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="admin-glass admin-kpi admin-skeleton" style={{ height: 100 }} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Executive Dashboard</h2>
        <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 4 }}>Platform overview and key metrics</p>
      </div>

      <div className="admin-kpi-grid">
        <KpiCard label="Total Users" value={kpis?.totalUsers ?? 0} icon={Users} />
        <KpiCard label="Active Today" value={kpis?.activeUsersToday ?? 0} icon={Activity} />
        <KpiCard label="New Registrations" value={kpis?.newRegistrations ?? 0} icon={UserPlus} />
        <KpiCard label="Total Fleets" value={kpis?.totalFleets ?? 0} icon={Truck} />
        <KpiCard label="Total Equipment" value={kpis?.totalEquipment ?? 0} icon={Truck} />
        <KpiCard label="Open Tickets" value={kpis?.openSupportTickets ?? 0} icon={Headphones} />
      </div>

      <div className="admin-chart-grid">
        <ChartCard title="User Growth (90 days)" data={userGrowth} loading={ugLoading} />
        <ChartCard title="Fleet Growth (90 days)" data={fleetGrowth} loading={fgLoading} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginTop: 24 }}>
        <div className="admin-glass" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingUp size={16} color="#E8692C" /> Most Active Customers
          </h3>
          {(kpis?.mostActiveCustomers ?? []).length === 0 ? (
            <div className="admin-empty" style={{ padding: 24 }}>No customer activity yet</div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {kpis?.mostActiveCustomers.map((c) => (
                <li key={c.userId} style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name || c.email}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{c.email}</div>
                  </div>
                  <span className="admin-badge admin-badge-active">{c.equipmentCount} assets</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="admin-glass" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Recent Activities</h3>
          {recentLoading ? (
            <div className="admin-skeleton" style={{ height: 120 }} />
          ) : (recent?.activities ?? []).length === 0 ? (
            <div className="admin-empty" style={{ padding: 24 }}>No recent activity</div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {recent?.activities.map((a, i) => (
                <li key={i} style={{ padding: "8px 0", fontSize: 13, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ color: "#E8692C", fontWeight: 600 }}>{a.action}</span>
                  {a.entityType && <span style={{ color: "#94a3b8" }}> · {a.entityType}</span>}
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{new Date(a.createdAt).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="admin-glass" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Marketing Highlights</h3>
          {(highlights?.highlights ?? []).map((h, i) => (
            <div key={i} style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 11, color: "#E8692C", fontWeight: 600 }}>{h.type}</div>
              <div style={{ fontWeight: 600, fontSize: 13, marginTop: 4 }}>{h.title}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{h.summary}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
