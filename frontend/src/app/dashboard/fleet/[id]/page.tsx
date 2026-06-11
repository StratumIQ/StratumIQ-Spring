"use client";

import { useParams } from "next/navigation";
import FleetDetail from "@/components/dashboard/fleet/FleetDetail";

export default function FleetDetailPage() {
  const params = useParams();
  const id = parseInt(params.id as string, 10);

  if (isNaN(id)) {
    return (
      <div style={{ textAlign: "center", padding: 40, color: "var(--d-text3)" }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Invalid Equipment ID</h2>
        <p style={{ fontSize: 13 }}>The equipment ID provided is not valid.</p>
      </div>
    );
  }

  return <FleetDetail id={id} />;
}