"use client";
import PageShell from "@/components/dashboard/layout/PageShell";
import ComingSoon from "@/components/dashboard/common/ComingSoon";
import KpiCard from "@/components/dashboard/common/KpiCard";
import { Package, Truck, Activity, CheckCircle2, AlertTriangle } from "lucide-react";

export default function PartsPage() {
  return (
    <PageShell title="Parts" breadcrumbs={[{ label: "Parts" }] }>
      <div className="d-kpi-grid" style={{ marginBottom: 8 }}>
        <KpiCard label="Inventory" value={0} icon={<Package size={18} />} color="#D97706" />
        <KpiCard label="Low Stock" value={0} icon={<AlertTriangle size={18} />} color="#DC2626" />
        <KpiCard label="Suppliers" value={0} icon={<Truck size={18} />} color="#0EA5A5" />
        <KpiCard label="Available" value={0} icon={<CheckCircle2 size={18} />} color="#10B981" />
      </div>
      <ComingSoon module="Parts" />
    </PageShell>
  );
}