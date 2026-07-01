"use client";
import PageShell from "@/components/dashboard/layout/PageShell";
import ComingSoon from "@/components/dashboard/common/ComingSoon";
import KpiCard from "@/components/dashboard/common/KpiCard";
import { Wrench, Truck, AlertTriangle, Activity } from "lucide-react";

export default function MaintenancePage() {
  return (
    <PageShell title="Maintenance" breadcrumbs={[{ label: "Maintenance" }] }>
      <div className="d-kpi-grid" style={{ marginBottom: 8 }}>
        <KpiCard label="Open" value={0} icon={<Wrench size={18} />} color="#2563EB" />
        <KpiCard label="Scheduled" value={0} icon={<Truck size={18} />} color="#E8692C" />
        <KpiCard label="Overdue" value={0} icon={<AlertTriangle size={18} />} color="#DC2626" />
        <KpiCard label="Active" value={0} icon={<Activity size={18} />} color="#10B981" />
      </div>
      <ComingSoon module="Maintenance" />
    </PageShell>
  );
}