"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Cpu } from "lucide-react";
import PageShell from "../layout/PageShell";
import KpiCard from "../common/KpiCard";
import { Truck, Wrench, AlertTriangle, Activity } from "lucide-react";
import FilterBar from "../common/FilterBar";
import ViewToggle, { type ViewMode } from "../ui/ViewToggle";
import Button from "../ui/Button";
import GlassCard from "../ui/GlassCard";
import Pagination from "../ui/Pagination";
import EmptyState from "../ui/EmptyState";
import Skeleton from "../ui/Skeleton";
import { useEquipmentList, useOEMs } from "./hooks/useEquipment";
import { Badge, TYPE_LABELS, MOBILITY_LABELS } from "./shared/EqUI";
import type { EquipmentType, MobilityType } from "@/types/equipment";

const TYPES: { label: string; value: EquipmentType }[] = [
  { label: "Jaw Crusher", value: "jaw_crusher" },
  { label: "Cone Crusher", value: "cone_crusher" },
  { label: "HSI Crusher", value: "hsi_crusher" },
  { label: "VSI Crusher", value: "vsi_crusher" },
  { label: "Gyratory Crusher", value: "gyratory_crusher" },
  { label: "Screen", value: "screen" },
  { label: "Feeder", value: "feeder" },
  { label: "Conveyor", value: "conveyor" },
];

const MOBILITIES: { label: string; value: MobilityType }[] = [
  { label: "Static", value: "static" },
  { label: "Track", value: "track" },
  { label: "Wheel", value: "wheel" },
  { label: "Portable", value: "portable" },
  { label: "Modular", value: "modular" },
];

export default function EquipmentListPage() {
  const router = useRouter();
  const [view, setView] = useState<ViewMode>("table");
  const { items, total, pages, loading, error, query, updateQuery, refetch } = useEquipmentList();
  const { oems } = useOEMs();
  const [search, setSearch] = useState("");

  const applySearch = () => updateQuery({ search });

  return (
    <PageShell
      title="Equipment Registry"
      breadcrumbs={[{ label: "Equipment" }]}
      actions={
        <Button icon={<Plus size={15} />} onClick={() => router.push("/dashboard/equipment/new")}>
          Add Equipment
        </Button>
      }
    >
      <div className="d-kpi-grid" style={{ marginBottom: 8 }}>
        <KpiCard label="Total" value={total ?? 0} icon={<Truck size={18} />} color="#E8692C" />
        <KpiCard label="Active" value={items.filter((i) => (i.status || "").toLowerCase() === "active").length} icon={<Activity size={18} />} color="#2563EB" />
        <KpiCard label="Maintenance" value={items.filter((i) => (i.application_stage || "").toLowerCase().includes("maint")).length} icon={<Wrench size={18} />} color="#F59E0B" />
        <KpiCard label="Alerts" value={0} icon={<AlertTriangle size={18} />} color="#DC2626" />
      </div>
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search brand, model…"
        selects={[
          {
            key: "type",
            value: query.equipment_type ?? "",
            width: 150,
            options: [{ value: "", label: "All Types" }, ...TYPES.map((t) => ({ value: t.value, label: t.label }))],
            onChange: (v) =>
              updateQuery({ equipment_type: (v as EquipmentType) || undefined }),
          },
          {
            key: "mobility",
            value: query.mobility_type ?? "",
            width: 140,
            options: [
              { value: "", label: "All Mobility" },
              ...MOBILITIES.map((m) => ({ value: m.value, label: m.label })),
            ],
            onChange: (v) =>
              updateQuery({ mobility_type: (v as MobilityType) || undefined }),
          },
          {
            key: "oem",
            value: String(query.oem_id ?? ""),
            width: 150,
            options: [
              { value: "", label: "All OEMs" },
              ...oems.map((o) => ({
                value: String(o.oem_id),
                label: o.name,
              })),
            ],
            onChange: (v) => updateQuery({ oem_id: v ? Number(v) : undefined }),
          },
        ]}
        trailing={
          <>
            <Button variant="outline" size="sm" onClick={applySearch}>
              Search
            </Button>
            <ViewToggle value={view} onChange={setView} />
          </>
        }
      />

      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={52} />
          ))}
        </div>
      )}

      {error && (
        <GlassCard padding="md">
          <p style={{ color: "var(--red)", fontSize: 13 }}>{error}</p>
        </GlassCard>
      )}

      {!loading && !error && items.length === 0 && (
        <EmptyState
          icon={Cpu}
          title="No equipment found"
          description="Add your first machine to the equipment catalogue."
          action={{
            label: "Add Equipment",
            onClick: () => router.push("/dashboard/equipment/new"),
          }}
        />
      )}

      {!loading && !error && items.length > 0 && view === "table" && (
        <GlassCard padding="none" className="d-data-table-wrap">
          <table className="d-data-table">
            <thead>
              <tr>
                <th>Model</th>
                <th>Type</th>
                <th>Brand / OEM</th>
                <th>Mobility</th>
                <th>Stage</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {items.map((eq) => (
                <tr
                  key={eq.equipment_id}
                  onClick={() => router.push(`/dashboard/equipment/${eq.equipment_id}`)}
                >
                  <td>
                    <div style={{ fontWeight: 700, color: "var(--t1)" }}>{eq.model_name}</div>
                    <div style={{ fontSize: 11, color: "var(--t3)", fontFamily: "monospace" }}>
                      {eq.equipment_id}
                    </div>
                  </td>
                  <td>{TYPE_LABELS[eq.equipment_type] ?? eq.equipment_type}</td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{eq.brand}</span>
                    {eq.oem_name && (
                      <span style={{ color: "var(--t3)", marginLeft: 4 }}>· {eq.oem_name}</span>
                    )}
                  </td>
                  <td>{MOBILITY_LABELS[eq.mobility_type] ?? eq.mobility_type}</td>
                  <td style={{ color: "var(--t3)", fontSize: 12 }}>{eq.application_stage ?? "—"}</td>
                  <td>
                    <Badge label={eq.status} variant={eq.status} />
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="d-data-table-actions">
                      <Link href={`/dashboard/equipment/${eq.equipment_id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                      <Link href={`/dashboard/equipment/${eq.equipment_id}/edit`}>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}

      {!loading && !error && items.length > 0 && view === "grid" && (
        <div className="d-fleet-grid">
          {items.map((eq) => (
            <GlassCard
              key={eq.equipment_id}
              hover
              className="d-fleet-card"
              onClick={() => router.push(`/dashboard/equipment/${eq.equipment_id}`)}
            >
              <div className="d-fleet-card-body">
                <div className="d-fleet-card-name">{eq.model_name}</div>
                <div className="d-fleet-card-meta" style={{ fontFamily: "monospace", fontSize: 11 }}>
                  {eq.equipment_id}
                </div>
                <div className="d-fleet-card-rows" style={{ marginTop: 12 }}>
                  <div className="d-fleet-card-row">
                    Type
                    <span>{TYPE_LABELS[eq.equipment_type] ?? eq.equipment_type}</span>
                  </div>
                  <div className="d-fleet-card-row">
                    Brand
                    <span>{eq.brand}</span>
                  </div>
                  <div className="d-fleet-card-row">
                    Mobility
                    <span>{MOBILITY_LABELS[eq.mobility_type] ?? eq.mobility_type}</span>
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <Badge label={eq.status} variant={eq.status} />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {pages > 1 && (
        <Pagination
          page={query.page ?? 1}
          totalPages={pages}
          total={total}
          onPageChange={(page) => updateQuery({ page })}
        />
      )}
    </PageShell>
  );
}
