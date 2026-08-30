"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import PartForm from "@/components/dashboard/parts/PartForm";
import { partsApi, type PartWritePayload } from "@/lib/api/parts";

export default function NewAdminPartPage() {
  const router = useRouter(); const queryClient = useQueryClient();
  const create = useMutation({ mutationFn: (payload: PartWritePayload) => partsApi.admin.create(payload), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-parts"] }); toast.success("Listing created"); router.replace("/dashboard-admin/parts"); }, onError: (e: Error) => toast.error(e.message) });
  return <div><div className="admin-panel-header" style={{ marginBottom: 24 }}><div><h2 className="admin-page-title">Add marketplace listing</h2><p className="admin-page-sub">Create a listing for an eligible dealer.</p></div></div><PartForm mode="admin" submitting={create.isPending} onSubmit={create.mutate} onCancel={() => router.back()} /></div>;
}
