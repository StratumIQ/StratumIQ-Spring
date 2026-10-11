"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import PartForm from "@/components/dashboard/parts/PartForm";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import Button from "@/components/dashboard/ui/Button";
import { Package } from "lucide-react";
import { partsApi, type PartWritePayload } from "@/lib/api/parts";

export default function EditAdminPartPage() {
  const { id } = useParams<{ id: string }>(); const partId = Number(id); const router = useRouter(); const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["admin-part", partId], queryFn: () => partsApi.admin.get(partId), enabled: Number.isInteger(partId) && partId > 0 });
  const update = useMutation({ mutationFn: (payload: PartWritePayload) => partsApi.admin.update(partId, payload), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-parts"] }); toast.success("Listing updated"); router.replace("/dashboard-admin/parts"); }, onError: (e: Error) => toast.error(e.message) });
  const archive = useMutation({ mutationFn: () => partsApi.admin.archive(partId), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-parts"] }); toast.success("Listing archived"); router.replace("/dashboard-admin/parts"); }, onError: (e: Error) => toast.error(e.message) });
  if (query.isLoading) return <div className="admin-glass" style={{ padding: 20 }}>Loading listing…</div>;
  if (query.isError || !query.data) return <EmptyState icon={Package} title="Listing unavailable" description="The listing could not be found." action={{ label: "Back to parts", href: "/dashboard-admin/parts" }} />;
  return <div><div className="admin-panel-header" style={{ marginBottom: 24 }}><div><h2 className="admin-page-title">Edit: {query.data.partName}</h2><p className="admin-page-sub">Update listing details or archive the listing.</p></div><Button variant="danger" loading={archive.isPending} onClick={() => { if (window.confirm("Archive this listing?")) archive.mutate(); }}>Archive</Button></div><PartForm initial={query.data} mode="admin" submitting={update.isPending} onSubmit={update.mutate} onCancel={() => router.back()} /></div>;
}
