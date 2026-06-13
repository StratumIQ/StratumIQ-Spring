/**
 * AnalyticsTab — Fleet asset performance charts (Recharts)
 */

"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Download, TrendingUp, Activity, Wrench, AlertTriangle } from "lucide-react";
import GlassCard from "../../ui/GlassCard";
import Button from "../../ui/Button";
import { BRAND, DASH } from "@/lib/constants";
import { safeFloat } from "@/lib/utils";
import type { FleetEquipment, ServiceRecord, OperationLog } from "@/types/fleet";

const CHART_COLORS = {
  primary: BRAND.orange,
  green: "#16A34A",
  red: "#DC2626",
  blue: "#2563EB",
  amber: "#F59E0B",
};

interface AnalyticsTabProps {
  equipment: FleetEquipment;
  serviceRecords?: ServiceRecord[];
  operations?: OperationLog[];
}

export default function AnalyticsTab({
  equipment,
  serviceRecords = [],
  operations = [],
}: AnalyticsTabProps) {
  const [exporting, setExporting] = useState(false);

  const analytics = useMemo(() => {
    const currentHours = safeFloat(equipment.running_hours);
    const serviceCount = serviceRecords.length;
    const overdueCount = serviceRecords.filter((r) => r.status === "OVERDUE").length;
    const totalMaintenanceCost = serviceRecords.reduce(
      (sum, r) => sum + (r.cost ? parseFloat(r.cost) : 0),
      0,
    );
    const costPerHour = currentHours > 0 ? totalMaintenanceCost / currentHours : 0;
    const downtimeEvents = operations.filter(
      (o) => o.event_type?.toLowerCase() === "downtime",
    ).length;
    const uptimePercentage = Math.max(0, Math.min(100, 100 - downtimeEvents * 4));
    let efficiencyScore = 85 - overdueCount * 8 - (costPerHour > 500 ? 10 : 0);
    if (serviceCount > 2) efficiencyScore += 5;
    efficiencyScore = Math.min(100, Math.max(0, efficiencyScore));

    return {
      currentHours,
      serviceCount,
      overdueCount,
      totalMaintenanceCost,
      costPerHour,
      uptimePercentage,
      downtimeEvents,
      efficiencyScore,
    };
  }, [equipment, serviceRecords, operations]);

  const hoursTrend = useMemo(() => {
    const hourOps = operations
      .filter((o) => o.event_type?.toLowerCase() === "hours_update")
      .slice(0, 12)
      .reverse();

    if (hourOps.length === 0) {
      return [{ label: "Current", hours: analytics.currentHours }];
    }

    return hourOps.map((op, i) => ({
      label: new Date(op.logged_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      hours: safeFloat(op.total_hours_snapshot),
      idx: i,
    }));
  }, [operations, analytics.currentHours]);

  const serviceHistory = useMemo(() => {
    const buckets: Record<string, number> = {};
    serviceRecords.forEach((r) => {
      const key = r.service_date
        ? new Date(r.service_date).toLocaleDateString("en-US", { month: "short", year: "2-digit" })
        : "Unscheduled";
      buckets[key] = (buckets[key] ?? 0) + 1;
    });
    return Object.entries(buckets).map(([month, count]) => ({ month, count }));
  }, [serviceRecords]);

  const uptimeData = useMemo(
    () => [
      { name: "Uptime", value: analytics.uptimePercentage, color: CHART_COLORS.green },
      { name: "Downtime", value: 100 - analytics.uptimePercentage, color: CHART_COLORS.red },
    ],
    [analytics.uptimePercentage],
  );

  const serviceTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    serviceRecords.forEach((r) => {
      const t = r.service_type ?? "OTHER";
      counts[t] = (counts[t] ?? 0) + 1;
    });
    return Object.entries(counts).map(([type, value]) => ({
      name: type.replace(/_/g, " "),
      value,
    }));
  }, [serviceRecords]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = new Blob(
        [JSON.stringify({ equipment: { name: equipment.name }, analytics, generated_at: new Date().toISOString() }, null, 2)],
        { type: "application/json" },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${equipment.name}_analytics.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="d-analytics">
      <div className="d-analytics-header">
        <div>
          <h3 className="d-analytics-title">Performance Analytics</h3>
          <p className="d-analytics-sub">Utilization, uptime, and service metrics</p>
        </div>
        <Button variant="outline" size="sm" icon={<Download size={14} />} loading={exporting} onClick={handleExport}>
          Export
        </Button>
      </div>

      <div className="d-analytics-kpis">
        <KpiCard icon={<TrendingUp size={18} />} label="Efficiency" value={`${analytics.efficiencyScore}%`} color={CHART_COLORS.primary} />
        <KpiCard icon={<Activity size={18} />} label="Uptime" value={`${analytics.uptimePercentage.toFixed(1)}%`} color={CHART_COLORS.green} />
        <KpiCard icon={<Wrench size={18} />} label="Services" value={String(analytics.serviceCount)} color={CHART_COLORS.blue} />
        <KpiCard icon={<AlertTriangle size={18} />} label="Overdue" value={String(analytics.overdueCount)} color={analytics.overdueCount > 0 ? CHART_COLORS.red : CHART_COLORS.green} />
      </div>

      <div className="d-analytics-grid">
        <GlassCard padding="md" className="d-analytics-chart-card">
          <h4 className="d-analytics-chart-title">Running Hours Trend</h4>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={hoursTrend}>
              <defs>
                <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: DASH.text3 }} />
              <YAxis tick={{ fontSize: 11, fill: DASH.text3 }} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid rgba(0,0,0,0.08)" }} />
              <Area type="monotone" dataKey="hours" stroke={CHART_COLORS.primary} fill="url(#hoursGrad)" strokeWidth={2} animationDuration={800} />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard padding="md" className="d-analytics-chart-card">
          <h4 className="d-analytics-chart-title">Uptime vs Downtime</h4>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={uptimeData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" animationDuration={800}>
                {uptimeData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${Number(v).toFixed(1)}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard padding="md" className="d-analytics-chart-card">
          <h4 className="d-analytics-chart-title">Service History</h4>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={serviceHistory.length ? serviceHistory : [{ month: "None", count: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: DASH.text3 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: DASH.text3 }} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid rgba(0,0,0,0.08)" }} />
              <Bar dataKey="count" fill={CHART_COLORS.blue} radius={[6, 6, 0, 0]} animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard padding="md" className="d-analytics-chart-card">
          <h4 className="d-analytics-chart-title">Service Type Distribution</h4>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={serviceTypeData.length ? serviceTypeData : [{ name: "No records", value: 1 }]}
                cx="50%"
                cy="50%"
                outerRadius={85}
                dataKey="value"
                animationDuration={800}
              >
                {[CHART_COLORS.primary, CHART_COLORS.blue, CHART_COLORS.green, CHART_COLORS.amber].map((c, i) => (
                  <Cell key={i} fill={c} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {analytics.overdueCount > 0 && (
        <div className="d-analytics-alert">
          <AlertTriangle size={18} />
          <div>
            <strong>{analytics.overdueCount} overdue service{analytics.overdueCount !== 1 ? "s" : ""}</strong>
            <p>Schedule maintenance to improve fleet utilization and uptime.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <GlassCard padding="md" className="d-analytics-kpi">
      <div className="d-analytics-kpi-icon" style={{ color }}>{icon}</div>
      <div className="d-analytics-kpi-value" style={{ color }}>{value}</div>
      <div className="d-analytics-kpi-label">{label}</div>
    </GlassCard>
  );
}
