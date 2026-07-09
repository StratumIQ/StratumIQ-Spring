"use client";
import PageShell from "@/components/dashboard/layout/PageShell";
import ComingSoon from "@/components/dashboard/common/ComingSoon";

export default function PartsPage() {
  return (
    <PageShell>
      <ComingSoon module="Parts" />
    </PageShell>
  );
}