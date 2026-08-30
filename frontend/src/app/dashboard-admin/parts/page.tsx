"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Edit3, Package, Plus } from "lucide-react";
import MasterDataManager from "@/components/admin/parts/MasterDataManager";
import Button from "@/components/dashboard/ui/Button";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import FilterBar from "@/components/dashboard/common/FilterBar";
import Pagination from "@/components/dashboard/ui/Pagination";
import Badge from "@/components/dashboard/ui/Badge";
import { formatInr, partsApi, type PartStatus } from "@/lib/api/parts";
import PartCsvTransfer from "@/components/dashboard/parts/PartCsvTransfer";

export default function AdminPartsPage() {
  const [keyword, setKeyword] = useState(""); const [status, setStatus] = useState<PartStatus | "">("");  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ["admin-parts", keyword, status, page], queryFn: () => partsApi.admin.list({ keyword: keyword || undefined, status: (status || undefined) as PartStatus | undefined, page, limit: 25 }) });
  return <div>
    <div className="admin-panel-header" style={{ marginBottom: 24 }}><div><h2 className="admin-page-title">Parts marketplace</h2><p className="admin-page-sub">Manage marketplace listings and catalog master data.</p></div><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><PartCsvTransfer mode="admin" parts={data?.parts ?? []} onImported={() => void refetch()} /><Link href="/dashboard-admin/parts/new"><button className="admin-btn admin-btn-primary"><Plus size={15} /> Add listing</button></Link></div></div>
    <FilterBar search={keyword} onSearchChange={(value) => { setKeyword(value); setPage(1); }} searchPlaceholder="Search listings…" selects={[{ key: "status", value: status, onChange: (value) => { setStatus(value as PartStatus | ""); setPage(1); }, width: 180, options: [{ value: "", label: "All statuses" }, { value: "DRAFT", label: "Draft" }, { value: "ACTIVE", label: "Active" }, { value: "OUT_OF_STOCK", label: "Out of stock" }, { value: "DISCONTINUED", label: "Discontinued" }, { value: "ARCHIVED", label: "Archived" }] }]} />
    {isLoading && <div className="admin-glass" style={{ marginTop: 16, padding: 20 }}>Loading listings…</div>}
    {isError && <EmptyState icon={Package} title="Unable to load listings" description="Please try again." action={{ label: "Retry", onClick: () => void refetch() }} />}
    {!isLoading && !isError && !data?.parts.length && <EmptyState icon={Package} title="No listings found" description="Create the first marketplace listing." />}
    {!isLoading && !isError && !!data?.parts.length && <><div className="admin-glass" style={{ marginTop: 16, overflowX: "auto" }}><table className="d-part-list-table"><thead><tr><th>Part</th><th>Dealer</th><th>Price</th><th>Stock</th><th>Status</th><th /></tr></thead><tbody>{data.parts.map((part) => <tr key={part.id}><td><strong>{part.partName}</strong><small>{part.partNumber}</small></td><td>{part.dealerName ?? "—"}</td><td>{formatInr(part.discountPrice ?? part.price)}</td><td>{part.quantity}</td><td><Badge variant={part.status === "ACTIVE" ? "success" : part.status === "ARCHIVED" ? "danger" : "warning"}>{part.status.replaceAll("_", " ")}</Badge></td><td><Link href={`/dashboard-admin/parts/${part.id}`}><Button size="sm" variant="ghost" icon={<Edit3 size={14} />}>Edit</Button></Link></td></tr>)}</tbody></table></div><Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} total={data.pagination.total} onPageChange={setPage} /></>}
    <MasterDataManager />
  </div>;
}
