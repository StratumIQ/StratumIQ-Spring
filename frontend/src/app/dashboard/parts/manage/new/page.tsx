"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import PageShell from "@/components/dashboard/layout/PageShell";
import PartForm from "@/components/dashboard/parts/PartForm";
import { partsApi, type PartWritePayload } from "@/lib/api/parts";

export default function NewDealerPartPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: PartWritePayload) => partsApi.dealer.create(payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["dealer-parts"] }); toast.success("Listing created"); router.replace("/dashboard/parts/manage"); },
    onError: (error: Error) => toast.error(error.message),
  });
  return <PageShell title="Add part listing" breadcrumbs={[{ label: "Parts", href: "/dashboard/parts" }, { label: "My listings", href: "/dashboard/parts/manage" }, { label: "Add listing" }]}>
    <PartForm mode="dealer" submitting={mutation.isPending} onSubmit={mutation.mutate} onCancel={() => router.back()} />
  </PageShell>;
}
