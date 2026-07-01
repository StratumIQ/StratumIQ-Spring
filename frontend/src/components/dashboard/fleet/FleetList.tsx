"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Truck,
  ImageIcon,
  Pencil,
  Trash2,
  Clock,
  MapPin,
  Calendar,
  Wrench,
  AlertTriangle,
  Activity,
} from "lucide-react";
import KpiCard from "../common/KpiCard";
import PageShell from "../layout/PageShell";
import FilterBar from "../common/FilterBar";
import ViewToggle, { type ViewMode } from "../ui/ViewToggle";
import Button from "../ui/Button";
import GlassCard from "../ui/GlassCard";
import Pagination from "../ui/Pagination";
import EmptyState from "../ui/EmptyState";
import { SkeletonCard } from "../ui/Skeleton";
import {
  StatusBadge,
  FleetOverviewPanel,
  ErrorBanner,
} from "./shared/FleetUI";
import ConfirmDeleteModal from "./modals/ConfirmDeleteModal";
import { useFleet, useFleetSummary, useUpdateStatus, useDeleteEquipment } from "./hooks/useFleet";
import { notify } from "@/lib/toast";
import { resolveAssetUrl } from "@/lib/constants";
import type { FleetEquipment, EquipmentStatus, ListEquipmentParams } from "@/types/fleet";

// Must match Java EquipmentStatus enum (UPPER_CASE)
const STATUS_OPTIONS: Array<{ value: EquipmentStatus | "all"; label: string }> = [
  { value: "all",         label: "All Status" },
  { value: "ACTIVE",      label: "Active" },
  { value: "IDLE",        label: "Idle" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "RETIRED",     label: "Retired" },
];

// Must match Java EquipmentCategory enum (UPPER_CASE)
const CATEGORY_OPTIONS = [
  { value: "all",          label: "All Types" },
  { value: "CRUSHER",      label: "Crusher" },
  { value: "SCREENER",     label: "Screener" },
  { value: "CONVEYOR",     label: "Conveyor" },
  { value: "MOBILE_PLANT", label: "Mobile Plant" },
  { value: "OTHER",        label: "Other" },
];

const SORT_OPTIONS = [
  { value: "created_at_desc",       label: "Newest first" },
  { value: "created_at_asc",        label: "Oldest first" },
  { value: "name_asc",              label: "Name A–Z" },
  { value: "running_hours_desc",    label: "Most hours" },
  { value: "last_service_date_asc", label: "Service due" },
];

// Safe hours formatter — handles null, undefined, NaN
function fmtHours(val: string | number | null | undefined): string {
  const n = Number(val);
  return isNaN(n) ? "—" : n.toLocaleString();
}

export default function FleetList() {
  const router = useRouter();
  const [view, setView] = useState<ViewMode>("grid");
  const [params, setParams] = useState<ListEquipmentParams>({
    status:   "all",
    category: "all",
    page:     1,
    limit:    20,
    sort:     "created_at",
    order:    "desc",
  });
  const [search, setSearch] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    equipmentId: null as number | null,
    equipmentName: "",
  });

  const { data, loading, error, refetch } = useFleet({ ...params, search: search || undefined });
  const { summary, loading: sumLoading } = useFleetSummary();
  const { mutate: changeStatus } = useUpdateStatus();
  const { mutate: removeAsset, loading: removing } = useDeleteEquipment();

  const equipment  = data?.equipment ?? [];
  const pagination = data?.pagination;

  const handleStatusChange = async (eq: FleetEquipment, newStatus: EquipmentStatus) => {
    try {
      await changeStatus(eq.id, { status: newStatus }, () => {
        refetch();
        notify.success("Fleet status updated");
      });
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "Unable to update status");
      refetch();
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteModal.equipmentId === null) return;
    try {
      await removeAsset(deleteModal.equipmentId, () => {
        refetch();
        notify.success("Fleet asset removed");
        setDeleteModal({ isOpen: false, equipmentId: null, equipmentName: "" });
      });
    } catch (err) {
      notify.error(err instanceof Error ? err.message : "Unable to delete fleet asset");
      refetch();
      setDeleteModal({ isOpen: false, equipmentId: null, equipmentName: "" });
    }
  };

  return (
    <PageShell
      title="Fleet"
      description="Manage operational assets, status, and service history"
      breadcrumbs={[{ label: "Fleet" }]}
      actions={
        <Button icon={<Plus size={15} />} onClick={() => router.push("/dashboard/fleet/new")}>
          Add Asset
        </Button>
      }
    >
      <div className="d-kpi-grid" style={{ marginBottom: 8 }}>
        <KpiCard label="Assets" value={summary?.total ?? equipment.length ?? "—"} icon={<Truck size={18} />} color="#E8692C" loading={sumLoading} />
        <KpiCard label="Active" value={summary?.active ?? "—"} icon={<Activity size={18} />} color="#2563EB" loading={sumLoading} />
        <KpiCard label="Maintenance" value={summary?.maintenance ?? "—"} icon={<Wrench size={18} />} color="#7C3AED" loading={sumLoading} />
        <KpiCard label="Alerts" value={summary?.service_overdue_count ?? 0} icon={<AlertTriangle size={18} />} color="#DC2626" loading={sumLoading} />
      </div>
      <div className="d-fleet-layout">
        <div className="d-fleet-main">
          <FilterBar
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              setParams((p) => ({ ...p, page: 1 }));
            }}
            searchPlaceholder="Search name, brand, model…"
            selects={[
              {
                key:     "status",
                value:   params.status ?? "all",
                width:   130,
                options: STATUS_OPTIONS,
                onChange: (v) =>
                  setParams((p) => ({ ...p, status: v as EquipmentStatus | "all", page: 1 })),
              },
              {
                key:     "category",
                value:   params.category ?? "all",
                width:   130,
                options: CATEGORY_OPTIONS,
                onChange: (v) =>
                  setParams((p) => ({
                    ...p,
                    category: v as ListEquipmentParams["category"],
                    page: 1,
                  })),
              },
              {
                key:     "sort",
                value:   `${params.sort}_${params.order}`,
                width:   160,
                options: SORT_OPTIONS,
                onChange: (v) => {
                  const [sort, order] = v.split("_") as [
                    ListEquipmentParams["sort"],
                    ListEquipmentParams["order"],
                  ];
                  setParams((p) => ({ ...p, sort, order, page: 1 }));
                },
              },
            ]}
            trailing={<ViewToggle value={view} onChange={setView} />}
          />

          {error && <ErrorBanner message={error} />}

          {loading && (
            <div className="d-fleet-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {!loading && !error && equipment.length === 0 && (
            <EmptyState
              icon={Truck}
              title="No fleet assets yet"
              description="Register your first machine to start tracking operations and maintenance."
              action={{
                label:   "Add Fleet Asset",
                onClick: () => router.push("/dashboard/fleet/new"),
              }}
            />
          )}

          {!loading && !error && equipment.length > 0 && view === "grid" && (
            <div className="d-fleet-grid">
              {equipment.map((eq) => (
                <FleetCard
                  key={eq.id}
                  equipment={eq}
                  onView={() => router.push(`/dashboard/fleet/${eq.id}`)}
                  onEdit={() => router.push(`/dashboard/fleet/${eq.id}/edit`)}
                  onStatusChange={(s) => handleStatusChange(eq, s)}
                  onDelete={() =>
                    setDeleteModal({ isOpen: true, equipmentId: eq.id, equipmentName: eq.name })
                  }
                />
              ))}
            </div>
          )}

          {!loading && !error && equipment.length > 0 && view === "table" && (
            <GlassCard padding="none" className="d-data-table-wrap">
              <table className="d-data-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Status</th>
                    <th>Hours</th>
                    <th>Location</th>
                    <th>Last Service</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {equipment.map((eq) => (
                    <tr key={eq.id} onClick={() => router.push(`/dashboard/fleet/${eq.id}`)}>
                      <td>
                        <div style={{ fontWeight: 700, color: "var(--t1)" }}>{eq.name}</div>
                        <div style={{ fontSize: 11.5, color: "var(--t3)" }}>
                          {[eq.brand, eq.model].filter(Boolean).join(" · ") || "—"}
                        </div>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <StatusBadge status={eq.status} />
                      </td>
                      <td>{fmtHours(eq.running_hours)} hrs</td>
                      <td>{eq.location || "—"}</td>
                      <td>
                        {eq.last_service_date
                          ? new Date(eq.last_service_date).toLocaleDateString("en-US", {
                              day: "numeric", month: "short", year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="d-data-table-actions">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Pencil size={13} />}
                            onClick={() => router.push(`/dashboard/fleet/${eq.id}/edit`)}
                            aria-label={`Edit ${eq.name}`}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Trash2 size={13} />}
                            onClick={() =>
                              setDeleteModal({
                                isOpen: true,
                                equipmentId: eq.id,
                                equipmentName: eq.name,
                              })
                            }
                            aria-label={`Delete ${eq.name}`}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </GlassCard>
          )}

          {pagination && pagination.totalPages > 1 && (
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              onPageChange={(page) => setParams((p) => ({ ...p, page }))}
            />
          )}
        </div>

        <aside className="d-fleet-aside" aria-label="Fleet overview">
          {sumLoading ? (
            <div className="d-skeleton d-skeleton--lg" style={{ height: 340 }} />
          ) : summary ? (
            <GlassCard padding="md">
              <FleetOverviewPanel summary={summary} />
            </GlassCard>
          ) : null}
        </aside>
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, equipmentId: null, equipmentName: "" })}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.equipmentName}
        isDeleting={removing}
      />
    </PageShell>
  );
}

function FleetCard({
  equipment: eq,
  onView,
  onEdit,
  onStatusChange,
  onDelete,
}: {
  equipment: FleetEquipment;
  onView: () => void;
  onEdit: () => void;
  onStatusChange: (s: EquipmentStatus) => void;
  onDelete: () => void;
}) {
  return (
    <GlassCard hover className="d-fleet-card" onClick={onView}>
      <div className="d-fleet-card-img">
        {eq.image_url ? (
          <img src={resolveAssetUrl(eq.image_url) ?? eq.image_url} alt={eq.name} />
        ) : (
          <div className="d-fleet-card-placeholder">
            <ImageIcon size={40} strokeWidth={1.25} />
          </div>
        )}
        <div className="d-fleet-card-badge">
          <StatusBadge status={eq.status} />
        </div>
        <div className="d-fleet-card-actions">
          <button
            type="button"
            className="d-fleet-card-action-btn"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            aria-label="Edit"
          >
            <Pencil size={13} />
          </button>
          <button
            type="button"
            className="d-fleet-card-action-btn d-fleet-card-action-btn--danger"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            aria-label="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      <div className="d-fleet-card-body">
        <div className="d-fleet-card-name">{eq.name}</div>
        <div className="d-fleet-card-meta">
          {[eq.brand, eq.model].filter(Boolean).join(" · ") || "—"}
        </div>
        <div className="d-fleet-card-rows">
          <div className="d-fleet-card-row">
            <Clock size={12} /> Hours
            <span>{fmtHours(eq.running_hours)} hrs</span>
          </div>
          {eq.last_service_date && (
            <div className="d-fleet-card-row">
              <Calendar size={12} /> Service
              <span>
                {new Date(eq.last_service_date).toLocaleDateString("en-US", {
                  day: "numeric", month: "short",
                })}
              </span>
            </div>
          )}
          {eq.location && (
            <div className="d-fleet-card-row">
              <MapPin size={12} /> Location
              <span>{eq.location}</span>
            </div>
          )}
        </div>
      </div>
      <div className="d-fleet-card-footer" onClick={(e) => e.stopPropagation()}>
        <span style={{ fontSize: 11.5, color: "var(--t3)" }}>Status</span>
        <select
          value={eq.status}
          onChange={(e) => onStatusChange(e.target.value as EquipmentStatus)}
          aria-label="Change status"
        >
          {STATUS_OPTIONS.filter((o) => o.value !== "all").map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </GlassCard>
  );
}