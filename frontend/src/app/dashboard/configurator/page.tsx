"use client";
import { useEffect } from "react";
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

  return <ComingSoon module="Configurator" />;
}
