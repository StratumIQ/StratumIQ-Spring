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
    <div className="admin-page-shell">
      <div className="admin-page-header">
        <h2 className="admin-page-title">{eq.name}</h2>
        <p className="admin-page-sub">Read-only equipment detail</p>
      </div>
      <div className="admin-glass admin-panel">
        <div className="admin-detail-grid">
          <div className="admin-detail-item"><span className="admin-detail-label">Owner</span><div className="admin-detail-value">{eq.ownerName} ({eq.ownerEmail})</div></div>
          <div className="admin-detail-item"><span className="admin-detail-label">Status</span><div className="admin-detail-value">{eq.status}</div></div>
          <div className="admin-detail-item"><span className="admin-detail-label">Brand / Model</span><div className="admin-detail-value">{eq.brand} {eq.model}</div></div>
          <div className="admin-detail-item"><span className="admin-detail-label">Serial</span><div className="admin-detail-value">{eq.serialNumber || "—"}</div></div>
          <div className="admin-detail-item"><span className="admin-detail-label">Running hours</span><div className="admin-detail-value">{eq.runningHours}</div></div>
          <div className="admin-detail-item"><span className="admin-detail-label">Location</span><div className="admin-detail-value">{eq.location || "—"}</div></div>
        </div>
      </div>
    </div>
  );
}
