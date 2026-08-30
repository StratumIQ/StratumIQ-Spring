"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Edit3, Package, Plus } from "lucide-react";
import PartCsvTransfer from "@/components/dashboard/parts/PartCsvTransfer";
import PageShell from "@/components/dashboard/layout/PageShell";
import Button from "@/components/dashboard/ui/Button";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import FilterBar from "@/components/dashboard/common/FilterBar";
import Pagination from "@/components/dashboard/ui/Pagination";
import Badge from "@/components/dashboard/ui/Badge";
import { formatInr, partsApi, type PartStatus } from "@/lib/api/parts";

export default function MyPartsPage() {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<PartStatus | "">("");
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dealer-parts", keyword, status, page],
    queryFn: () => partsApi.dealer.list({ keyword: keyword || undefined, status: (status || undefined) as PartStatus | undefined, page, limit: 20 }),
  });

  return (
    <PageShell
      title="My part listings"
      description="Create, update, and track the aftermarket parts you offer."
      breadcrumbs={[{ label: "Parts", href: "/dashboard/parts" }, { label: "My listings" }]}
      actions={<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><PartCsvTransfer mode="dealer" parts={data?.parts ?? []} onImported={() => void refetch()} /><Link href="/dashboard/parts/manage/new"><Button icon={<Plus size={16} />}>Add listing</Button></Link></div>}
    >
      <FilterBar
        search={keyword}
        onSearchChange={(value) => { setKeyword(value); setPage(1); }}
        searchPlaceholder="Search your listings…"
        selects={[{ key: "status", value: status, onChange: (value) => { setStatus(value as PartStatus | ""); setPage(1); }, width: 180, options: [
          { value: "", label: "All statuses" }, { value: "DRAFT", label: "Draft" }, { value: "ACTIVE", label: "Active" },
          { value: "OUT_OF_STOCK", label: "Out of stock" }, { value: "DISCONTINUED", label: "Discontinued" }, { value: "ARCHIVED", label: "Archived" },
        ] }]}
      />
      {isLoading && <div className="d-part-panel" style={{ marginTop: 16 }}>Loading listings…</div>}
      {isError && <EmptyState icon={Package} title="Unable to load your listings" description="Please try again." action={{ label: "Retry", onClick: () => void refetch() }} />}
      {!isLoading && !isError && !data?.parts.length && <EmptyState icon={Package} title="No listings yet" description="Add your first aftermarket part to make it visible to buyers." action={{ label: "Add listing", href: "/dashboard/parts/manage/new" }} />}
      {!isLoading && !isError && !!data?.parts.length && <>
        <div className="d-part-panel" style={{ marginTop: 16, overflowX: "auto" }}>
          <table className="d-part-list-table"><thead><tr><th>Part</th><th>Part no.</th><th>Price</th><th>Stock</th><th>Status</th><th /></tr></thead>
            <tbody>{data.parts.map((part) => <tr key={part.id}>
              <td><strong>{part.partName}</strong><small>{part.categoryName ?? "Uncategorised"}</small></td><td>{part.partNumber}</td><td>{formatInr(part.discountPrice ?? part.price)}</td>
              <td>{part.quantity}</td><td><Badge variant={part.status === "ACTIVE" ? "success" : part.status === "ARCHIVED" ? "danger" : "warning"}>{part.status.replaceAll("_", " ")}</Badge></td>
              <td><Link href={`/dashboard/parts/manage/${part.id}`}><Button variant="ghost" size="sm" icon={<Edit3 size={14} />}>Edit</Button></Link></td>
            </tr>)}</tbody>
          </table>
        </div>
        <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} total={data.pagination.total} onPageChange={setPage} />
      </>}
    </PageShell>
  );
}
