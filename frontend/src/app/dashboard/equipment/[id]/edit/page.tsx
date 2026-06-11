// FILE PATH: frontend/src/app/dashboard/equipment/[id]/edit/page.tsx

"use client";

import { use } from "react";
import EquipmentEditor from "@/components/dashboard/equipment/EquipmentEditor";

export default function EditEquipmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <EquipmentEditor equipmentId={id} />;
}