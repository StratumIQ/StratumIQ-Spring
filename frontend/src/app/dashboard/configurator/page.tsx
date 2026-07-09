"use client";
import { useEffect } from "react";
import PageShell from "@/components/dashboard/layout/PageShell";
import ComingSoon from "@/components/dashboard/common/ComingSoon";
import { activityApi } from "@/lib/api/activity";

export default function ConfiguratorPage() {
  useEffect(() => {
    void activityApi.track({
      action: "CONFIGURATOR_OPENED",
      entityType: "CONFIGURATOR",
      metadata: { source: "dashboard" },
    }).catch(() => undefined);
  }, []);

  return (
    <PageShell>
      <ComingSoon module="Configurator" />
    </PageShell>
  );
}
