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
      <div className="admin-kpi-label">
        <Icon size={13} style={{ color: "#E8692C", flexShrink: 0 }} /> {label}
      </div>
      <div className="admin-kpi-value">{value}</div>
    </div>
  );
}

function ChartCard({ title, data, loading }: { title: string; data: ChartSeries | undefined; loading: boolean }) {
  if (loading) {
    return (
      <div className="admin-glass" style={{ padding: 20, minHeight: 280 }}>
        <div className="admin-skeleton" style={{ height: 18, width: 160, marginBottom: 16 }} />
        <div className="admin-skeleton" style={{ height: 200 }} />
      </div>
    );
  }

  const series = data?.series ?? [];

  return (
    <div className="admin-glass" style={{ padding: 20 }}>
      <h3 style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 16, color: "var(--a-t1)", margin: "0 0 16px" }}>{title}</h3>
      {series.length === 0 ? (
        <div className="admin-empty">No data yet</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={series}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
            <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 10,
                boxShadow: "0 4px 16px rgba(0,0,0,0.09)",
                fontSize: 12,
              }}
            />
            <Line type="monotone" dataKey="count" stroke="#E8692C" strokeWidth={2.5} dot={false} />
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

  const { data: recent, isLoading: recentLoading } = useQuery<{
    activities: Array<{ action: string; entityType: string; createdAt: string }>;
  }>({
    queryKey: ["admin", "recent"],
    queryFn: () => adminApi.recentActivities(10) as Promise<{ activities: Array<{ action: string; entityType: string; createdAt: string }> }>,
  });

  const { data: highlights } = useQuery<{
    highlights: Array<{ title: string; type: string; summary: string }>;
  }>({
    queryKey: ["admin", "highlights"],
    queryFn: () => adminApi.marketingHighlights() as Promise<{ highlights: Array<{ title: string; type: string; summary: string }> }>,
  });

  if (kpisLoading) {
    return (
      <div>
        <div className="admin-page-header">
          <div className="admin-skeleton" style={{ height: 28, width: 220, marginBottom: 8 }} />
          <div className="admin-skeleton" style={{ height: 16, width: 300 }} />
        </div>
        <div className="admin-kpi-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="admin-glass admin-kpi admin-skeleton" style={{ height: 100 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="admin-page-header">
        <h2 className="admin-page-title">Executive Dashboard</h2>
        <p className="admin-page-sub">Platform overview and key metrics</p>
      </div>

      {/* KPI cards */}
      <div className="admin-kpi-grid">
        <KpiCard label="Total Users"        value={kpis?.totalUsers ?? 0}          icon={Users}     />
        <KpiCard label="Active Today"       value={kpis?.activeUsersToday ?? 0}    icon={Activity}  />
        <KpiCard label="New Registrations"  value={kpis?.newRegistrations ?? 0}    icon={UserPlus}  />
        <KpiCard label="Total Fleets"       value={kpis?.totalFleets ?? 0}         icon={Truck}     />
        <KpiCard label="Total Equipment"    value={kpis?.totalEquipment ?? 0}      icon={Truck}     />
        <KpiCard label="Open Tickets"       value={kpis?.openSupportTickets ?? 0}  icon={Headphones}/>
      </div>

      {/* Charts */}
      <div className="admin-chart-grid">
        <ChartCard title="User Growth (90 days)"  data={userGrowth}  loading={ugLoading} />
        <ChartCard title="Fleet Growth (90 days)" data={fleetGrowth} loading={fgLoading} />
      </div>

      {/* Bottom 3-column grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginTop: 20 }}>

        {/* Most active customers */}
        <div className="admin-glass" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 13.5, fontWeight: 700, margin: "0 0 16px", color: "var(--a-t1)", display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingUp size={15} color="#E8692C" /> Most Active Customers
          </h3>
          {(kpis?.mostActiveCustomers ?? []).length === 0 ? (
            <div className="admin-empty">No customer activity yet</div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {kpis?.mostActiveCustomers.map((c) => (
                <li key={c.userId} style={{ padding: "10px 0", borderBottom: "1px solid var(--a-b2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "var(--a-t1)" }}>{c.name || c.email}</div>
                    <div style={{ fontSize: 11, color: "var(--a-t3)", marginTop: 2 }}>{c.email}</div>
                  </div>
                  <span className="admin-badge admin-badge-active">{c.equipmentCount} assets</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent activities */}
        <div className="admin-glass" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 13.5, fontWeight: 700, margin: "0 0 16px", color: "var(--a-t1)" }}>Recent Activities</h3>
          {recentLoading ? (
            <div className="admin-skeleton" style={{ height: 120 }} />
          ) : (recent?.activities ?? []).length === 0 ? (
            <div className="admin-empty">No recent activity</div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {recent?.activities.map((a, i) => (
                <li key={i} style={{ padding: "8px 0", borderBottom: "1px solid var(--a-b2)" }}>
                  <div style={{ fontSize: 13, color: "var(--a-t1)", display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ color: "#E8692C", fontWeight: 700 }}>{a.action}</span>
                    {a.entityType && <span style={{ color: "var(--a-t3)" }}>· {a.entityType}</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--a-t4)", marginTop: 3 }}>
                    {new Date(a.createdAt).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Marketing highlights */}
        <div className="admin-glass" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 13.5, fontWeight: 700, margin: "0 0 16px", color: "var(--a-t1)" }}>Marketing Highlights</h3>
          {(highlights?.highlights ?? []).length === 0 ? (
            <div className="admin-empty">No highlights yet</div>
          ) : (
            highlights?.highlights.map((h, i) => (
              <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid var(--a-b2)" }}>
                <div style={{ fontSize: 10.5, color: "#E8692C", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>{h.type}</div>
                <div style={{ fontWeight: 700, fontSize: 13, marginTop: 3, color: "var(--a-t1)" }}>{h.title}</div>
                <div style={{ fontSize: 12, color: "var(--a-t3)", marginTop: 4, lineHeight: 1.5 }}>{h.summary}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}