"use client";

import { use } from "react";
import EquipmentDetail from "@/components/dashboard/equipment/EquipmentDetail";

export default function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <EquipmentDetail equipmentId={id} />;
}