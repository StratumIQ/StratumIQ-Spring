"use client";
import PageShell from "@/components/dashboard/layout/PageShell";
import ComingSoon from "@/components/dashboard/common/ComingSoon";

export default function AlertsPage() {
  return (
    <PageShell
      title="Alerts"
      description="Operational alerts will appear here when the module is connected to live fleet and maintenance events."
      breadcrumbs={[{ label: "Alerts" }]}
    >
      <ComingSoon module="Alerts" />
    </PageShell>
  );
}
