"use client";
import PageShell from "@/components/dashboard/layout/PageShell";
import ComingSoon from "@/components/dashboard/common/ComingSoon";

export default function MaintenancePage() {
  return (
    <PageShell
      title="Maintenance"
      description="Service scheduling and overdue work will appear here when the module is connected to live records."
      breadcrumbs={[{ label: "Maintenance" }]}
    >
      <ComingSoon module="Maintenance" />
    </PageShell>
  );
}
