"use client";
import { use } from "react";
import EquipmentSpecPage from "@/components/dashboard/EquipmentSpecView";
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <EquipmentSpecPage equipmentId={id} />;
}