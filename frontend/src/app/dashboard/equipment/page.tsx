// FILE PATH: frontend/src/app/dashboard/equipment/page.tsx
"use client";

import PageShell from "@/components/dashboard/layout/PageShell";
import ComingSoon from "@/components/dashboard/common/ComingSoon";

export default function EquipmentPage() {
  return (
    <PageShell>
      <ComingSoon module="Equipment" />
    </PageShell>
  );
}
