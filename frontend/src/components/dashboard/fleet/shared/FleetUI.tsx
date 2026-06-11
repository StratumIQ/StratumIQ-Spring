/**
 * Fleet Shared UI — StratumIQ
 * Path: frontend/src/components/dashboard/fleet/shared/FleetUI.tsx
 *
 * Reusable primitives for the fleet module only.
 * All design tokens come from globals.css CSS variables and constants.ts.
 * No framer-motion — uses CSS animations from globals.css.
 */

"use client";

import { BRAND, DASH, EQUIPMENT_STATUS_CONFIG } from "@/lib/constants";
import type { EquipmentStatus, FleetSummary } from "@/types/fleet";

// ── StatusBadge ───────────────────────────────────────────────
export function StatusBadge({ status }: { status: EquipmentStatus }) {
  const cfg = EQUIPMENT_STATUS_CONFIG[status] ?? { label: status, color: "#6B7280", bg: "rgba(107,114,128,0.08)" };
  return (
    <span style={{
      display:      "inline-flex",
      alignItems:   "center",
      gap:          5,
      padding:      "3px 9px",
      borderRadius: 99,
      fontSize:     11,
      fontWeight:   700,
      letterSpacing:"0.05em",
      background:   cfg.bg,
      color:        cfg.color,
      whiteSpace:   "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

// ── CategoryBadge ─────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  crusher:     "Crusher",
  screener:    "Screener",
  conveyor:    "Conveyor",
  mobile_plant:"Mobile Plant",
  other:       "Other",
};

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span style={{
      display:      "inline-flex",
      padding:      "2px 8px",
      borderRadius: 6,
      fontSize:     11,
      fontWeight:   600,
      background:   "rgba(37,99,235,0.08)",
      color:        "#2563EB",
      letterSpacing:"0.04em",
    }}>
      {CATEGORY_LABELS[category] ?? category}
    </span>
  );
}

// ── ServiceTypeBadge ──────────────────────────────────────────
const SR_TYPE_COLORS: Record<string, { color: string; bg: string }> = {
  preventive:  { color: "#16A34A", bg: "rgba(22,163,74,0.08)"  },
  corrective:  { color: "#DC2626", bg: "rgba(220,38,38,0.08)"  },
  inspection:  { color: "#2563EB", bg: "rgba(37,99,235,0.08)"  },
};
const SR_STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  scheduled:   { color: "#2563EB", bg: "rgba(37,99,235,0.08)"  },
  in_progress: { color: "#D97706", bg: "rgba(217,119,6,0.08)"  },
  completed:   { color: "#16A34A", bg: "rgba(22,163,74,0.08)"  },
  overdue:     { color: "#DC2626", bg: "rgba(220,38,38,0.08)"  },
};

export function ServiceTypeBadge({ type }: { type: string }) {
  const cfg = SR_TYPE_COLORS[type] ?? { color: "#6B7280", bg: "rgba(107,114,128,0.08)" };
  const label = type.charAt(0).toUpperCase() + type.slice(1);
  return (
    <span className="chip" style={{ background: cfg.bg, color: cfg.color }}>{label}</span>
  );
}

export function ServiceStatusBadge({ status }: { status: string }) {
  const cfg = SR_STATUS_COLORS[status] ?? { color: "#6B7280", bg: "rgba(107,114,128,0.08)" };
  const label = status.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase());
  return (
    <span className="chip" style={{ background: cfg.bg, color: cfg.color }}>{label}</span>
  );
}

// ── Stat card for fleet overview widget ───────────────────────
export function OverviewStatCard({
  label, value, color,
}: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{
      display:       "flex",
      flexDirection: "column",
      gap:           4,
      padding:       "14px 16px",
      background:    DASH.surface2,
      borderRadius:  10,
      border:        `1px solid ${DASH.border}`,
      flex:          1,
      minWidth:      0,
    }}>
      <span style={{ fontSize: 22, fontWeight: 800, color: color ?? DASH.text, letterSpacing: "-0.03em" }}>
        {value}
      </span>
      <span style={{ fontSize: 11.5, color: DASH.text3, fontWeight: 500 }}>{label}</span>
    </div>
  );
}

// ── Fleet Overview Panel (sidebar widget) ─────────────────────
export function FleetOverviewPanel({ summary }: { summary: FleetSummary }) {
  const healthScore = summary.total === "0" ? 100 :
    Math.round((parseInt(summary.active) / parseInt(summary.total)) * 100);
  const healthColor = healthScore >= 70 ? "#16A34A" : healthScore >= 40 ? "#D97706" : "#DC2626";
  const healthLabel = healthScore >= 70 ? "Good" : healthScore >= 40 ? "Fair" : "Critical";

  return (
    <div style={{
      background:   DASH.surface,
      border:       `1px solid ${DASH.border}`,
      borderRadius: 14,
      padding:      "18px 20px",
      boxShadow:    DASH.shadowSm,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: DASH.text, marginBottom: 14 }}>Fleet Overview</div>

      {/* Health bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 11.5, color: DASH.text3 }}>Fleet Health</span>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: healthColor }}>{healthLabel}</span>
        </div>
        <div style={{ height: 6, background: DASH.surface2, borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${healthScore}%`, background: healthColor, borderRadius: 99, transition: "width 0.6s ease" }} />
        </div>
      </div>

      {/* Stat rows */}
      {[
        { label: "Total Assets",   value: summary.total },
        { label: "Active Assets",  value: summary.active,      color: "#16A34A" },
        { label: "Idle",           value: summary.idle,        color: "#D97706" },
        { label: "Maintenance",    value: summary.maintenance, color: BRAND.orange },
        { label: "Retired",        value: summary.retired,     color: "#6B7280" },
        { label: "Avg. Utilization", value: summary.avg_running_hours ? `${parseFloat(summary.avg_running_hours).toLocaleString()} hrs` : "—" },
        { label: "Service Due",    value: summary.service_overdue_count, color: parseInt(summary.service_overdue_count) > 0 ? "#D97706" : undefined },
      ].map(({ label, value, color }) => (
        <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${DASH.border2}` }}>
          <span style={{ fontSize: 12.5, color: DASH.text3 }}>{label}</span>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: color ?? DASH.text }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div style={{ background: DASH.surface, borderRadius: 14, border: `1px solid ${DASH.border}`, padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="skeleton" style={{ height: 14, width: "60%", borderRadius: 6 }} />
      <div className="skeleton" style={{ height: 11, width: "40%", borderRadius: 6 }} />
      <div className="skeleton" style={{ height: 11, width: "80%", borderRadius: 6 }} />
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <div className="skeleton" style={{ height: 22, width: 60, borderRadius: 99 }} />
        <div className="skeleton" style={{ height: 22, width: 80, borderRadius: 99 }} />
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────
export function EmptyFleet({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "64px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(232,105,44,0.08)", border: "1.5px solid rgba(232,105,44,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
        🚛
      </div>
      <div>
        <div style={{ fontSize: 17, fontWeight: 700, color: DASH.text, marginBottom: 6 }}>No equipment yet</div>
        <div style={{ fontSize: 13.5, color: DASH.text3, maxWidth: 320 }}>
          Add your first asset to start tracking status, running hours, and maintenance.
        </div>
      </div>
      <button className="btn-primary" onClick={onAdd} style={{ marginTop: 4 }}>
        + Add Equipment
      </button>
    </div>
  );
}

// ── Error banner ──────────────────────────────────────────────
export function ErrorBanner({ message }: { message: string }) {
  return (
    <div style={{
      padding:    "12px 16px",
      borderRadius: 10,
      background: "rgba(220,38,38,0.06)",
      border:     "1px solid rgba(220,38,38,0.2)",
      fontSize:   13,
      color:      "#DC2626",
      fontWeight: 500,
    }}>
      {message}
    </div>
  );
}