/**
 * FleetList — StratumIQ
 * Path: frontend/src/components/dashboard/fleet/FleetList.tsx
 *
 * Main fleet page: header, filter bar, asset cards grid, fleet overview panel.
 * All data via useFleet + useFleetSummary hooks.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BRAND, DASH } from "@/lib/constants";
import { safeFloat } from "@/lib/utils";
import { useFleet, useFleetSummary, useUpdateStatus, useDeleteEquipment } from "./hooks/useFleet";
import {
  StatusBadge, CategoryBadge, FleetOverviewPanel,
  SkeletonCard, EmptyFleet, ErrorBanner,
} from "./shared/FleetUI";
import { Icons } from "./shared/FleetIcons";
import ConfirmDeleteModal from "./modals/ConfirmDeleteModal";
import type { FleetEquipment, EquipmentStatus, ListEquipmentParams } from "@/types/fleet";

const STATUS_OPTIONS: Array<{ value: EquipmentStatus | "all"; label: string }> = [
  { value: "all",         label: "All Status"  },
  { value: "active",      label: "Active"      },
  { value: "idle",        label: "Idle"        },
  { value: "maintenance", label: "Maintenance" },
  { value: "retired",     label: "Retired"     },
];

const CATEGORY_OPTIONS = [
  { value: "all",         label: "All Types"    },
  { value: "crusher",     label: "Crusher"      },
  { value: "screener",    label: "Screener"     },
  { value: "conveyor",    label: "Conveyor"     },
  { value: "mobile_plant",label: "Mobile Plant" },
  { value: "other",       label: "Other"        },
];

export default function FleetList() {
  const router = useRouter();

  const [params, setParams] = useState<ListEquipmentParams>({
    status: "all", category: "all", page: 1, limit: 20, sort: "created_at", order: "desc",
  });
  const [search, setSearch] = useState("");
  
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; equipmentId: number | null; equipmentName: string }>({
    isOpen: false,
    equipmentId: null,
    equipmentName: "",
  });

  const { data, loading, error, refetch } = useFleet({ ...params, search: search || undefined });
  const { summary, loading: sumLoading } = useFleetSummary();
  const { mutate: changeStatus } = useUpdateStatus();
  const { mutate: removeAsset, loading: removing } = useDeleteEquipment();

  const handleStatusChange = async (eq: FleetEquipment, newStatus: EquipmentStatus) => {
    try {
      await changeStatus(eq.id, { status: newStatus }, () => refetch());
    } catch {
      refetch();
    }
  };

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteModal({ isOpen: true, equipmentId: id, equipmentName: name });
  };

  const handleDeleteConfirm = async () => {
    if (deleteModal.equipmentId === null) return;
    try {
      await removeAsset(deleteModal.equipmentId, () => {
        refetch();
        setDeleteModal({ isOpen: false, equipmentId: null, equipmentName: "" });
      });
    } catch {
      refetch();
      setDeleteModal({ isOpen: false, equipmentId: null, equipmentName: "" });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, equipmentId: null, equipmentName: "" });
  };

  const equipment = data?.equipment ?? [];
  const pagination = data?.pagination;

  return (
    <>
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>

        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Page header with premium icons */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${BRAND.orangeDim}, rgba(232,105,44,0.08))`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: BRAND.orange,
                }}>
                  <Icons.Fleet size={22} />
                </div>
                <div>
                  <h1 style={{ fontSize: 22, fontWeight: 800, color: DASH.text, letterSpacing: "-0.03em", margin: 0 }}>
                    My Fleet
                  </h1>
                  <p style={{ fontSize: 13, color: DASH.text3, margin: "2px 0 0" }}>
                    Your operational assets at a glance.
                  </p>
                </div>
              </div>
            </div>
            <button className="btn-primary" onClick={() => router.push("/dashboard/fleet/new")}>
              <Icons.AddEquipment size={16} />
              Add New Equipment
            </button>
          </div>

          {/* Filter bar with premium icons */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ position: "relative", flex: 1, minWidth: 180, maxWidth: 320 }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: DASH.text3 }}>
                <Icons.Search size={14} />
              </span>
              <input
                className="dash-input"
                style={{ paddingLeft: 36, height: 38, fontSize: 13 }}
                placeholder="Search name, brand, model…"
                value={search}
                onChange={e => { setSearch(e.target.value); setParams(p => ({ ...p, page: 1 })); }}
              />
            </div>

            {/* Status filter */}
            <div style={{ position: "relative" }}>
              <select
                className="dash-input"
                style={{ height: 38, fontSize: 13, width: 130, paddingRight: 32, cursor: "pointer", appearance: "none" }}
                value={params.status ?? "all"}
                onChange={e => setParams(p => ({ ...p, status: e.target.value as EquipmentStatus | "all", page: 1 }))}
              >
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: DASH.text3 }}>
                <Icons.ChevronDown size={12} />
              </span>
            </div>

            {/* Category filter */}
            <div style={{ position: "relative" }}>
              <select
                className="dash-input"
                style={{ height: 38, fontSize: 13, width: 130, paddingRight: 32, cursor: "pointer", appearance: "none" }}
                value={params.category ?? "all"}
                onChange={e => setParams(p => ({ ...p, category: e.target.value as ListEquipmentParams["category"], page: 1 }))}
              >
                {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: DASH.text3 }}>
                <Icons.ChevronDown size={12} />
              </span>
            </div>

            {/* Sort - FIXED options to match backend whitelist */}
            <div style={{ position: "relative" }}>
              <select
                className="dash-input"
                style={{ height: 38, fontSize: 13, width: 160, paddingRight: 32, cursor: "pointer", appearance: "none" }}
                value={`${params.sort}_${params.order}`}
                onChange={e => {
                  const [sort, order] = e.target.value.split("_") as [ListEquipmentParams["sort"], ListEquipmentParams["order"]];
                  setParams(p => ({ ...p, sort, order, page: 1 }));
                }}
              >
                <option value="created_at_desc">Newest first</option>
                <option value="created_at_asc">Oldest first</option>
                <option value="name_asc">Name A–Z</option>
                <option value="running_hours_desc">Most hours</option>
                <option value="last_service_date_asc">Service due</option>
              </select>
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: DASH.text3 }}>
                <Icons.Sort size={12} />
              </span>
            </div>
          </div>

          {error && <ErrorBanner message={error} />}

          {loading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
              {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
            </div>
          )}

          {!loading && !error && equipment.length === 0 && (
            <EmptyFleet onAdd={() => router.push("/dashboard/fleet/new")} />
          )}

          {!loading && !error && equipment.length > 0 && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
                {equipment.map(eq => (
                  <AssetCard
                    key={eq.id}
                    equipment={eq}
                    onView={() => router.push(`/dashboard/fleet/${eq.id}`)}
                    onEdit={() => router.push(`/dashboard/fleet/${eq.id}/edit`)}
                    onStatusChange={newStatus => handleStatusChange(eq, newStatus)}
                    onDelete={() => handleDeleteClick(eq.id, eq.name)}
                    deleting={removing}
                  />
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 24 }}>
                  <button
                    className="btn-secondary"
                    style={{ height: 34, fontSize: 12.5, display: "flex", alignItems: "center", gap: 4 }}
                    disabled={params.page === 1}
                    onClick={() => setParams(p => ({ ...p, page: (p.page ?? 1) - 1 }))}
                  >
                    <Icons.ArrowLeft size={14} /> Prev
                  </button>
                  <span style={{ fontSize: 13, color: DASH.text2 }}>
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    className="btn-secondary"
                    style={{ height: 34, fontSize: 12.5, display: "flex", alignItems: "center", gap: 4 }}
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setParams(p => ({ ...p, page: (p.page ?? 1) + 1 }))}
                  >
                    Next <Icons.ArrowRight size={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Fleet overview sidebar */}
        <div style={{ width: 240, flexShrink: 0, position: "sticky", top: "calc(60px + 28px)" }}>
          {sumLoading
            ? <div className="skeleton" style={{ height: 340, borderRadius: 14 }} />
            : summary
              ? <FleetOverviewPanel summary={summary} />
              : null
          }
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.equipmentName}
        isDeleting={removing}
      />
    </>
  );
}

// ── Asset Card with premium icons ──
function AssetCard({
  equipment, onView, onEdit, onStatusChange, onDelete, deleting,
}: {
  equipment: FleetEquipment;
  onView: () => void;
  onEdit: () => void;
  onStatusChange: (s: EquipmentStatus) => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  const eq = equipment;

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", cursor: "pointer" }}>
      {/* Image / placeholder with premium icon */}
      <div
        style={{ height: 140, background: "linear-gradient(135deg, #EDE7E3, #E5DDD8)", position: "relative", overflow: "hidden" }}
        onClick={onView}
      >
        {eq.image_url ? (
          <img src={eq.image_url} alt={eq.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>
            <Icons.Image size={48} />
          </div>
        )}
        {/* Status badge overlay */}
        <div style={{ position: "absolute", top: 10, left: 10 }}>
          <StatusBadge status={eq.status} />
        </div>
        {/* Edit + Delete buttons */}
        <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 6 }}>
          <button
            onClick={e => { e.stopPropagation(); onEdit(); }}
            style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: DASH.text }}
            title="Edit"
          >
            <Icons.Edit size={14} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            disabled={deleting}
            style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#DC2626" }}
            title="Remove"
          >
            <Icons.Delete size={14} />
          </button>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: "14px 16px" }} onClick={onView}>
        <div style={{ fontSize: 15, fontWeight: 700, color: DASH.text, letterSpacing: "-0.02em", marginBottom: 2, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
          {eq.name}
        </div>
        <div style={{ fontSize: 12.5, color: DASH.text3, marginBottom: 10 }}>
          {[eq.brand, eq.model].filter(Boolean).join(" · ") || "—"}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <InfoRow icon={<Icons.Clock size={12} />} label="Hours" value={`${parseFloat(eq.running_hours).toLocaleString()} hrs`} />
          {eq.last_service_date && (
            <InfoRow icon={<Icons.Calendar size={12} />} label="Last Service" value={new Date(eq.last_service_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} />
          )}
          {eq.location && (
            <InfoRow icon={<Icons.Location size={12} />} label="Location" value={eq.location} />
          )}
        </div>
      </div>

      {/* Inline status switcher */}
      <div style={{ padding: "10px 16px", borderTop: `1px solid ${DASH.border}`, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 11.5, color: DASH.text3, fontWeight: 500 }}>Status:</span>
        <div style={{ position: "relative", flex: 1 }}>
          <select
            style={{ width: "100%", height: 28, fontSize: 11.5, borderRadius: 7, border: `1px solid ${DASH.border}`, background: DASH.surface, color: DASH.text, fontFamily: "inherit", cursor: "pointer", outline: "none", paddingLeft: 8, appearance: "none" }}
            value={eq.status}
            onClick={e => e.stopPropagation()}
            onChange={e => { e.stopPropagation(); onStatusChange(e.target.value as EquipmentStatus); }}
          >
            {STATUS_OPTIONS.filter(o => o.value !== "all").map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: DASH.text3 }}>
            <Icons.ChevronDown size={10} />
          </span>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ width: 16, flexShrink: 0, color: DASH.text3 }}>{icon}</span>
      <span style={{ fontSize: 11.5, color: DASH.text3, flexShrink: 0 }}>{label}:</span>
      <span style={{ fontSize: 11.5, color: DASH.text2, fontWeight: 600, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{value}</span>
    </div>
  );
}