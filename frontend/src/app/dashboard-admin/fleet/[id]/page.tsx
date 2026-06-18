"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/services/admin/adminClient";
import type { AdminEquipment } from "@/types/admin";

export default function AdminFleetDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: eq, isLoading } = useQuery<AdminEquipment>({
    queryKey: ["admin", "equipment", id],
    queryFn: () => adminApi.getEquipment(Number(id)) as Promise<AdminEquipment>,
  });

  if (isLoading || !eq) {
    return <div className="admin-glass" style={{ padding: 24 }}><div className="admin-skeleton" style={{ height: 200 }} /></div>;
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{eq.name}</h2>
      <p style={{ color: "#94a3b8", marginBottom: 24 }}>Read-only equipment detail</p>
      <div className="admin-glass" style={{ padding: 24, maxWidth: 640 }}>
        <div style={{ display: "grid", gap: 12, fontSize: 14 }}>
          <div><span style={{ color: "#64748b" }}>Owner</span><div>{eq.ownerName} ({eq.ownerEmail})</div></div>
          <div><span style={{ color: "#64748b" }}>Status</span><div>{eq.status}</div></div>
          <div><span style={{ color: "#64748b" }}>Brand / Model</span><div>{eq.brand} {eq.model}</div></div>
          <div><span style={{ color: "#64748b" }}>Serial</span><div>{eq.serialNumber || "—"}</div></div>
          <div><span style={{ color: "#64748b" }}>Running hours</span><div>{eq.runningHours}</div></div>
          <div><span style={{ color: "#64748b" }}>Location</span><div>{eq.location || "—"}</div></div>
        </div>
      </div>
    </div>
  );
}
