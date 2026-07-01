"use client";
import PageShell from "@/components/dashboard/layout/PageShell";
import ComingSoon from "@/components/dashboard/common/ComingSoon";
import KpiCard from "@/components/dashboard/common/KpiCard";
import { Bell, AlertTriangle, Truck, Activity } from "lucide-react";

export default function AlertsPage() {
  return (
    <PageShell title="Alerts" breadcrumbs={[{ label: "Alerts" }] }>
      <div className="d-kpi-grid" style={{ marginBottom: 8 }}>
        <KpiCard label="Active" value={0} icon={<Bell size={18} />} color="#DC2626" />
        <KpiCard label="Critical" value={0} icon={<AlertTriangle size={18} />} color="#DC2626" />
        <KpiCard label="Affects" value={0} icon={<Truck size={18} />} color="#E8692C" />
        <KpiCard label="Active Operators" value={0} icon={<Activity size={18} />} color="#10B981" />
      </div>
      <ComingSoon module="Alerts" />
    </PageShell>
  );
}