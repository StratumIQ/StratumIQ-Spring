// FILE PATH: frontend/src/app/dashboard/equipment/new/page.tsx
"use client";

import PageShell from "@/components/dashboard/layout/PageShell";
import ComingSoon from "@/components/dashboard/common/ComingSoon";

export default function NewEquipmentPage() {
  return (
    <PageShell>
      <ComingSoon module="Equipment" />
    </PageShell>
  );
}
