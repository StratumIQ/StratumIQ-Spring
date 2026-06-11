"use client";

/**
 * Equipment List Page — StratumIQ
 * /dashboard/equipment
 * Browse, filter, and search the full equipment catalogue.
 */

import { useState } from "react";
import Link from "next/link";
import { BRAND, DASH } from "@/lib/constants";
import { useEquipmentList, useOEMs } from "./hooks/useEquipment";
import { equipmentAPI } from "./api/equipment.api";
import { Badge, Spinner, useToast, TYPE_LABELS, MOBILITY_LABELS } from "./shared/EqUI";
import type { EquipmentType, MobilityType } from "@/types/equipment";

const O = BRAND.orange;

// ── Filter bar ────────────────────────────────────────────────────────────────

const TYPES: { label: string; value: EquipmentType }[] = [
  { label: "Jaw Crusher",      value: "jaw_crusher" },
  { label: "Cone Crusher",     value: "cone_crusher" },
  { label: "HSI Crusher",      value: "hsi_crusher" },
  { label: "VSI Crusher",      value: "vsi_crusher" },
  { label: "Gyratory Crusher", value: "gyratory_crusher" },
  { label: "Screen",           value: "screen" },
  { label: "Feeder",           value: "feeder" },
  { label: "Conveyor",         value: "conveyor" },
];

const MOBILITIES: { label: string; value: MobilityType }[] = [
  { label: "Static",   value: "static" },
  { label: "Track",    value: "track" },
  { label: "Wheel",    value: "wheel" },
  { label: "Portable", value: "portable" },
  { label: "Modular",  value: "modular" },
];

export default function EquipmentListPage() {
  const { items, total, pages, loading, error, query, updateQuery, refetch } = useEquipmentList();
  const { oems } = useOEMs();
  const { show, ToastEl } = useToast();
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateQuery({ search });
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await equipmentAPI.updateStatus(id, status);
      show("Status updated");
      refetch();
    } catch {
      show("Failed to update status", "error");
    }
  };

  return (
    <div>
      {ToastEl}

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: DASH.text, letterSpacing: "-0.03em", marginBottom: 4 }}>
            Equipment Catalogue
          </h1>
          <p style={{ fontSize: 13.5, color: DASH.text3 }}>
            {total} machines across crushers, screens, feeders & conveyors
          </p>
        </div>
        <Link href="/dashboard/equipment/new" style={{ textDecoration: "none" }}>
          <button className="btn-primary" style={{ gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Equipment
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div style={{
        background: DASH.surface, border: `1px solid ${DASH.border}`,
        borderRadius: 12, padding: "14px 16px", marginBottom: 16,
        display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center",
      }}>
        {/* Search */}
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 6, flex: 1, minWidth: 200 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={DASH.text3} strokeWidth="2"
              style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search brand, model…"
              style={{
                width: "100%", height: 34, paddingLeft: 30, paddingRight: 10,
                borderRadius: 8, border: `1.5px solid ${DASH.border}`,
                background: DASH.surface2, color: DASH.text,
                fontSize: 13, fontFamily: "inherit", outline: "none",
              }}
            />
          </div>
          <button type="submit" className="btn-secondary" style={{ height: 34, fontSize: 12 }}>Search</button>
        </form>

        {/* Type filter */}
        <select
          value={query.equipment_type ?? ""}
          onChange={e => updateQuery({ equipment_type: (e.target.value as EquipmentType) || undefined })}
          style={{
            height: 34, padding: "0 10px", borderRadius: 8,
            border: `1.5px solid ${DASH.border}`, background: DASH.surface2,
            color: DASH.text, fontSize: 13, fontFamily: "inherit", outline: "none",
          }}
        >
          <option value="">All Types</option>
          {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>

        {/* Mobility filter */}
        <select
          value={query.mobility_type ?? ""}
          onChange={e => updateQuery({ mobility_type: (e.target.value as MobilityType) || undefined })}
          style={{
            height: 34, padding: "0 10px", borderRadius: 8,
            border: `1.5px solid ${DASH.border}`, background: DASH.surface2,
            color: DASH.text, fontSize: 13, fontFamily: "inherit", outline: "none",
          }}
        >
          <option value="">All Mobility</option>
          {MOBILITIES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>

        {/* OEM filter */}
        <select
          value={query.oem_id ?? ""}
          onChange={e => updateQuery({ oem_id: e.target.value ? Number(e.target.value) : undefined })}
          style={{
            height: 34, padding: "0 10px", borderRadius: 8,
            border: `1.5px solid ${DASH.border}`, background: DASH.surface2,
            color: DASH.text, fontSize: 13, fontFamily: "inherit", outline: "none",
          }}
        >
          <option value="">All OEMs</option>
          {oems.map((o, idx) => <option key={`oem-${o.oem_id}-${idx}`} value={o.oem_id}>{o.name}</option>)}
        </select>

        {/* Clear */}
        {(query.equipment_type || query.mobility_type || query.oem_id || query.search) && (
          <button onClick={() => { setSearch(""); updateQuery({ equipment_type: undefined, mobility_type: undefined, oem_id: undefined, search: undefined }); }}
            style={{ height: 34, padding: "0 12px", borderRadius: 8, background: "none", border: `1px solid ${DASH.border}`, cursor: "pointer", fontSize: 12, color: DASH.text3, fontFamily: "inherit" }}>
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: DASH.surface, border: `1px solid ${DASH.border}`, borderRadius: 14, overflow: "hidden", boxShadow: DASH.shadowSm }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
            <Spinner size={28} />
          </div>
        ) : error ? (
          <div style={{ padding: 32, textAlign: "center", color: DASH.red, fontSize: 13 }}>{error}</div>
        ) : items.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🏗️</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: DASH.text, marginBottom: 4 }}>No equipment found</div>
            <p style={{ fontSize: 13, color: DASH.text3, marginBottom: 16 }}>Add your first machine to the catalogue</p>
            <Link href="/dashboard/equipment/new">
              <button className="btn-primary">Add Equipment</button>
            </Link>
          </div>
        ) : (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: DASH.surface2 }}>
                  {["Model", "Type", "Brand / OEM", "Mobility", "Stage", "Status", ""].map((h, idx) => (
                    <th key={`header-${h}-${idx}`} style={{
                      padding: "10px 14px", textAlign: "left",
                      fontSize: 11, fontWeight: 700, color: DASH.text3,
                      letterSpacing: "0.07em", textTransform: "uppercase",
                      borderBottom: `1px solid ${DASH.border}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((eq, i) => (
                  <tr key={eq.equipment_id}
                    style={{ borderBottom: i < items.length - 1 ? `1px solid ${DASH.border}` : "none" }}>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontWeight: 700, color: DASH.text, marginBottom: 1 }}>{eq.model_name}</div>
                      <div style={{ fontSize: 11, color: DASH.text3, fontFamily: "monospace" }}>{eq.equipment_id}</div>
                    </td>
                    <td style={{ padding: "12px 14px", color: DASH.text2 }}>
                      {TYPE_LABELS[eq.equipment_type] ?? eq.equipment_type}
                    </td>
                    <td style={{ padding: "12px 14px", color: DASH.text2 }}>
                      <span style={{ fontWeight: 600 }}>{eq.brand}</span>
                      {eq.oem_name && <span style={{ color: DASH.text3, marginLeft: 4 }}>· {eq.oem_name}</span>}
                    </td>
                    <td style={{ padding: "12px 14px", color: DASH.text2 }}>
                      {MOBILITY_LABELS[eq.mobility_type] ?? eq.mobility_type}
                    </td>
                    <td style={{ padding: "12px 14px", color: DASH.text3, fontSize: 12 }}>
                      {eq.application_stage ?? "—"}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <Badge label={eq.status} variant={eq.status} />
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Link href={`/dashboard/equipment/${eq.equipment_id}`}>
                          <button className="btn-secondary" style={{ height: 28, padding: "0 10px", fontSize: 11 }}>
                            View
                          </button>
                        </Link>
                        <Link href={`/dashboard/equipment/${eq.equipment_id}/edit`}>
                          <button className="btn-secondary" style={{ height: 28, padding: "0 10px", fontSize: 11 }}>
                            Edit
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pages > 1 && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 16px", borderTop: `1px solid ${DASH.border}`,
                fontSize: 13, color: DASH.text3,
              }}>
                <span>Page {query.page ?? 1} of {pages} — {total} total</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    disabled={(query.page ?? 1) <= 1}
                    onClick={() => updateQuery({ page: (query.page ?? 1) - 1 })}
                    className="btn-secondary"
                    style={{ height: 30, padding: "0 12px", fontSize: 12 }}
                  >← Prev</button>
                  <button
                    disabled={(query.page ?? 1) >= pages}
                    onClick={() => updateQuery({ page: (query.page ?? 1) + 1 })}
                    className="btn-secondary"
                    style={{ height: 30, padding: "0 12px", fontSize: 12 }}
                  >Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}