"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Package } from "lucide-react";
import { toast } from "sonner";
import PageShell from "@/components/dashboard/layout/PageShell";
import Button from "@/components/dashboard/ui/Button";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import Skeleton from "@/components/dashboard/ui/Skeleton";
import Badge from "@/components/dashboard/ui/Badge";
import PartGallery from "@/components/dashboard/parts/PartGallery";
import PartCard from "@/components/dashboard/parts/PartCard";
import { ApiError } from "@/lib/api/client";
import { formatInr, partsApi, sellingPrice } from "@/lib/api/parts";

export default function PartDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState("");

  const { data: part, isLoading, isError } = useQuery({
    queryKey: ["part", id],
    queryFn: () => partsApi.catalog.get(id),
    enabled: Number.isFinite(id),
  });
  const { data: related = [] } = useQuery({
    queryKey: ["part-related", id],
    queryFn: () => partsApi.catalog.related(id),
    enabled: Number.isFinite(id),
  });

  const inquire = useMutation({
    mutationFn: () => partsApi.catalog.inquire(id, { message, quantity: qty }),
    onSuccess: () => {
      toast.success("Quote request sent. Track it under Support.");
      setMessage("");
      router.push("/dashboard/support");
    },
    onError: (err: unknown) => {
      toast.error(err instanceof ApiError ? err.message : "Could not send inquiry");
    },
  });

  if (isLoading) {
    return (
      <PageShell title="Part" breadcrumbs={[{ label: "Parts", href: "/dashboard/parts" }, { label: "…" }]}>
        <Skeleton height={360} />
      </PageShell>
    );
  }

  if (isError || !part) {
    return (
      <PageShell title="Part" breadcrumbs={[{ label: "Parts", href: "/dashboard/parts" }, { label: "Not found" }]}>
        <EmptyState
          icon={Package}
          title="Product is currently unavailable"
          description="This listing may be archived or the link is invalid."
          action={{ label: "Back to Parts", href: "/dashboard/parts" }}
        />
      </PageShell>
    );
  }

  const sell = sellingPrice(part);
  const hasDiscount = part.discountPrice != null && Number(part.discountPrice) > 0 && Number(part.discountPrice) < Number(part.price);

  return (
    <PageShell
      title={part.partName}
      description={part.shortDescription || undefined}
      breadcrumbs={[{ label: "Parts", href: "/dashboard/parts" }, { label: part.partName }]}
    >
      <div className="d-part-detail">
        <PartGallery part={part} />
        <div className="d-part-panel">
          <div style={{ fontSize: 12, color: "var(--t3)", fontWeight: 600, marginBottom: 6 }}>
            {[part.brandName, part.categoryName].filter(Boolean).join(" · ") || "Aftermarket"}
          </div>
          <h2 style={{ margin: "0 0 8px", fontSize: 22 }}>{part.partName}</h2>
          <div style={{ fontSize: 13, color: "var(--t3)", marginBottom: 12 }}>
            Part no. {part.partNumber}{part.sku ? ` · SKU ${part.sku}` : ""}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 26, fontWeight: 800 }}>{formatInr(sell)}</span>
            {hasDiscount && <span style={{ textDecoration: "line-through", color: "var(--t4)" }}>{formatInr(part.price)}</span>}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            <Badge variant={part.inStock ? "success" : "warning"}>{part.inStock ? "In stock" : "Check availability"}</Badge>
            {part.partType && <Badge>{part.partType}</Badge>}
            {part.partCondition && <Badge variant="info">{part.partCondition}</Badge>}
          </div>
          {part.dealerName && <p style={{ fontSize: 13, color: "var(--t2)" }}>Seller: {part.dealerName}</p>}
          {part.description && <p style={{ fontSize: 14, color: "var(--t2)", lineHeight: 1.55 }}>{part.description}</p>}

          <table className="d-part-spec-table">
            <tbody>
              {part.oemNumber && <tr><th>OEM number</th><td>{part.oemNumber}</td></tr>}
              {part.manufacturerName && <tr><th>Manufacturer</th><td>{part.manufacturerName}</td></tr>}
              {part.warranty && <tr><th>Warranty</th><td>{part.warranty}</td></tr>}
              {part.unitName && <tr><th>Unit</th><td>{part.unitName}</td></tr>}
              {(part.length || part.width || part.height) && (
                <tr><th>Dimensions</th><td>{[part.length, part.width, part.height].filter((v) => v != null).join(" × ")}</td></tr>
              )}
              {part.weight != null && <tr><th>Weight</th><td>{part.weight} kg</td></tr>}
              {(part.attributes ?? []).map((a) => (
                <tr key={`${a.name}-${a.value}`}><th>{a.name}</th><td>{a.value}</td></tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            <label className="d-part-label">
              Quantity
              <input className="dash-input" type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} style={{ maxWidth: 120 }} />
            </label>
            <label className="d-part-label">
              Inquiry message
              <textarea className="dash-input" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Machine model, required quantity, delivery location…" />
            </label>
            <Button
              loading={inquire.isPending}
              disabled={!message.trim()}
              onClick={() => inquire.mutate()}
            >
              Request quote
            </Button>
            <p style={{ fontSize: 12, color: "var(--t3)", margin: 0 }}>
              Sends a support ticket. There is no checkout in this release.
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>Related parts</h3>
          <div className="d-part-grid">
            {related.map((item) => <PartCard key={item.id} part={item} />)}
          </div>
        </div>
      )}
    </PageShell>
  );
}
