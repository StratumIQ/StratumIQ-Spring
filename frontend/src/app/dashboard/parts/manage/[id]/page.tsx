"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import PageShell from "@/components/dashboard/layout/PageShell";
import PartForm from "@/components/dashboard/parts/PartForm";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import Button from "@/components/dashboard/ui/Button";
import { Package } from "lucide-react";
import { partsApi, type PartWritePayload } from "@/lib/api/parts";

export default function EditDealerPartPage() {
  const { id } = useParams<{ id: string }>();
  const partId = Number(id); const router = useRouter(); const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["dealer-part", partId], queryFn: () => partsApi.dealer.get(partId), enabled: Number.isInteger(partId) && partId > 0 });
  const update = useMutation({ mutationFn: (payload: PartWritePayload) => partsApi.dealer.update(partId, payload), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["dealer-parts"] }); toast.success("Listing updated"); router.replace("/dashboard/parts/manage"); }, onError: (e: Error) => toast.error(e.message) });
  const archive = useMutation({ mutationFn: () => partsApi.dealer.archive(partId), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["dealer-parts"] }); toast.success("Listing archived"); router.replace("/dashboard/parts/manage"); }, onError: (e: Error) => toast.error(e.message) });
  if (query.isLoading) return <PageShell title="Edit listing"><div className="d-part-panel">Loading listing…</div></PageShell>;
  if (query.isError || !query.data) return <PageShell title="Edit listing"><EmptyState icon={Package} title="Listing unavailable" description="You may not have access to this listing." action={{ label: "My listings", href: "/dashboard/parts/manage" }} /></PageShell>;
  return <PageShell title={`Edit: ${query.data.partName}`} breadcrumbs={[{ label: "Parts", href: "/dashboard/parts" }, { label: "My listings", href: "/dashboard/parts/manage" }, { label: query.data.partName }]} actions={<Button variant="danger" loading={archive.isPending} onClick={() => { if (window.confirm("Archive this listing? It will no longer appear in the catalog.")) archive.mutate(); }}>Archive</Button>}>
    <PartForm initial={query.data} mode="dealer" submitting={update.isPending} onSubmit={update.mutate} onCancel={() => router.back()} />
  </PageShell>;
}
