/**
 * Equipment UI Shared Components — StratumIQ
 * Small, composable primitives used across all equipment tabs.
 * Uses the established dashboard design system (CSS variables).
 */

"use client";

import React from "react";
import { BRAND, DASH } from "@/lib/constants";

const O = BRAND.orange;

// ── Field wrapper ─────────────────────────────────────────────────────────────

export function Field({
  label, required, hint, error, children,
}: {
  label: string; required?: boolean; hint?: string;
  error?: string | null; children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: DASH.text3, letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {label}
        {required && <span style={{ color: O, marginLeft: 4, fontSize: 14 }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        {children}
        {error && (
          <div style={{ 
            position: "absolute", 
            right: 10, 
            top: "50%", 
            transform: "translateY(-50%)",
            pointerEvents: "none"
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={DASH.red} strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <circle cx="12" cy="16" r="1" fill={DASH.red} />
            </svg>
          </div>
        )}
      </div>
      {hint && <span style={{ fontSize: 11, color: DASH.text3 }}>{hint}</span>}
      {error && <span style={{ fontSize: 11, color: DASH.red, fontWeight: 500 }}>{error}</span>}
    </div>
  );
}

// ── Text / Number Input ───────────────────────────────────────────────────────

export function Input({
  value, onChange, placeholder, type = "text", disabled, required, error,
}: {
  value: string | number | undefined;
  onChange: (v: string) => void;
  placeholder?: string; type?: string;
  disabled?: boolean; required?: boolean;
  error?: string | null;
}) {
  const [focused, setFocused] = React.useState(false);
  
  const hasError = !!error && error !== "";
  
  return (
    <input
      type={type}
      value={value ?? ""}
      required={required}
      disabled={disabled}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
      style={{
        width: "100%", height: 38, padding: "0 12px",
        borderRadius: 8,
        border: `1.5px solid ${
          hasError ? DASH.red : 
          focused ? O : 
          DASH.border
        }`,
        background: disabled ? DASH.surface2 : DASH.surface,
        color: DASH.text, fontSize: 13.5, fontFamily: "inherit",
        outline: "none", transition: "border-color .15s",
        ...(hasError && { paddingRight: 32 }),
      }}
    />
  );
}

// ── Select ────────────────────────────────────────────────────────────────────

export function Select({
  value, onChange, options, placeholder, disabled, error,
}: {
  value: string | undefined;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string; disabled?: boolean;
  error?: string | null;
}) {
  // Filter out options with undefined or null values
  const validOptions = options.filter(o => o.value !== undefined && o.value !== null && o.value !== "");
  const hasError = !!error && error !== "";
  
  return (
    <select
      value={value ?? ""}
      disabled={disabled}
      onChange={e => onChange(e.target.value)}
      style={{
        width: "100%", height: 38, padding: "0 10px",
        borderRadius: 8, 
        border: `1.5px solid ${hasError ? DASH.red : DASH.border}`,
        background: DASH.surface, color: value ? DASH.text : DASH.text3,
        fontSize: 13.5, fontFamily: "inherit", outline: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        ...(hasError && { borderColor: DASH.red }),
      }}
    >
      {placeholder && <option key="placeholder" value="">{placeholder}</option>}
      {validOptions.map((o, index) => (
        <option key={`${o.value}-${index}`} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// ── Textarea ──────────────────────────────────────────────────────────────────

export function Textarea({
  value, onChange, placeholder, rows = 3, error,
}: {
  value: string | undefined;
  onChange: (v: string) => void;
  placeholder?: string; rows?: number;
  error?: string | null;
}) {
  const [focused, setFocused] = React.useState(false);
  const hasError = !!error && error !== "";
  
  return (
    <textarea
      value={value ?? ""}
      rows={rows}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
      style={{
        width: "100%", padding: "10px 12px",
        borderRadius: 8,
        border: `1.5px solid ${
          hasError ? DASH.red : 
          focused ? O : 
          DASH.border
        }`,
        background: DASH.surface, color: DASH.text,
        fontSize: 13.5, fontFamily: "inherit", outline: "none",
        resize: "vertical", transition: "border-color .15s",
        lineHeight: 1.6,
      }}
    />
  );
}

// ── Toggle (boolean) ──────────────────────────────────────────────────────────

export function Toggle({ checked, onChange, label }: {
  checked: boolean | undefined; onChange: (v: boolean) => void; label: string;
}) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 36, height: 20, borderRadius: 99,
          background: checked ? O : DASH.border,
          position: "relative", transition: "background .2s", flexShrink: 0,
          cursor: "pointer",
        }}
      >
        <div style={{
          position: "absolute", top: 3, left: checked ? 19 : 3,
          width: 14, height: 14, borderRadius: "50%",
          background: "#fff", transition: "left .2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }} />
      </div>
      <span style={{ fontSize: 13.5, color: DASH.text2, fontWeight: 500 }}>{label}</span>
    </label>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  active:        { color: "#16A34A", bg: "rgba(22,163,74,0.1)" },
  draft:         { color: DASH.amber, bg: "rgba(217,119,6,0.1)" },
  discontinued:  { color: DASH.text3, bg: DASH.surface2 },
  positive:      { color: "#16A34A", bg: "rgba(22,163,74,0.1)" },
  negative:      { color: DASH.red,  bg: "rgba(220,38,38,0.1)" },
  neutral:       { color: DASH.text3, bg: DASH.surface2 },
};

export function Badge({ label, variant = "active" }: {
  label: string; variant?: string;
}) {
  const c = STATUS_COLORS[variant] ?? STATUS_COLORS.draft;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 8px", borderRadius: 99,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
      color: c.color, background: c.bg,
    }}>
      {label.replace(/_/g, " ").toUpperCase()}
    </span>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────

export function SectionCard({
  title, subtitle, action, children,
}: {
  title: string; subtitle?: string;
  action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div style={{
      background: DASH.surface, border: `1px solid ${DASH.border}`,
      borderRadius: 14, overflow: "hidden", boxShadow: DASH.shadowSm,
      marginBottom: 16,
    }}>
      <div style={{
        padding: "16px 20px", borderBottom: `1px solid ${DASH.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: DASH.text }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: DASH.text3, marginTop: 1 }}>{subtitle}</div>}
        </div>
        {action}
      </div>
      <div style={{ padding: "20px" }}>
        {children}
      </div>
    </div>
  );
}

// ── Form grid ─────────────────────────────────────────────────────────────────

export function FormGrid({ cols = 2, children }: {
  cols?: number; children: React.ReactNode;
}) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: "14px 16px",
    }}>
      {children}
    </div>
  );
}

export function FormRow({ children }: { children: React.ReactNode }) {
  return <div style={{ gridColumn: "1 / -1" }}>{children}</div>;
}

// ── Save button ───────────────────────────────────────────────────────────────

export function SaveBtn({
  loading, onClick, label = "Save Changes",
}: {
  loading?: boolean; onClick?: () => void; label?: string;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
      <button
        onClick={onClick}
        disabled={loading}
        style={{
          padding: "0 22px", height: 38, borderRadius: 9,
          background: loading ? `${O}88` : O,
          color: "#fff", border: "none", fontSize: 13.5,
          fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "inherit", display: "flex",
          alignItems: "center", gap: 8, transition: "background .15s",
        }}
      >
        {loading && (
          <svg style={{ animation: "spin 0.8s linear infinite" }} width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
            <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        )}
        {loading ? "Saving..." : label}
      </button>
    </div>
  );
}

// ── Icon button ───────────────────────────────────────────────────────────────

export function IconBtn({
  onClick, title, danger, children,
}: {
  onClick: () => void; title?: string; danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 30, height: 30, borderRadius: 7,
        background: "transparent", border: `1px solid ${DASH.border}`,
        cursor: "pointer", display: "flex",
        alignItems: "center", justifyContent: "center",
        color: danger ? DASH.red : DASH.text3,
        transition: "all .15s",
      }}
      onMouseOver={e => {
        (e.currentTarget as HTMLElement).style.background = danger ? "rgba(220,38,38,0.08)" : DASH.surface2;
        (e.currentTarget as HTMLElement).style.color = danger ? DASH.red : DASH.text;
      }}
      onMouseOut={e => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
        (e.currentTarget as HTMLElement).style.color = danger ? DASH.red : DASH.text3;
      }}
    >
      {children}
    </button>
  );
}

// ── Simple table ──────────────────────────────────────────────────────────────

export function DataTable({
  columns, rows, emptyText = "No data yet",
}: {
  columns: { key: string; label: string; width?: number | string }[];
  rows: Record<string, React.ReactNode>[];
  emptyText?: string;
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {columns.map(c => (
              <th key={c.key} style={{
                padding: "8px 12px", textAlign: "left",
                fontSize: 11, fontWeight: 700, color: DASH.text3,
                letterSpacing: "0.06em", textTransform: "uppercase",
                borderBottom: `1px solid ${DASH.border}`,
                width: c.width,
              }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{
                padding: "28px 12px", textAlign: "center",
                color: DASH.text3, fontSize: 13,
              }}>
                {emptyText}
              </td>
            </tr>
          ) : rows.map((row, idx) => (
            <tr key={`row-${idx}`} style={{ borderBottom: `1px solid ${DASH.border}` }}>
              {columns.map(c => (
                <td key={`${c.key}-${idx}`} style={{ padding: "10px 12px", color: DASH.text2 }}>
                  {row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

export function EmptyState({ icon, title, desc, action }: {
  icon: string; title: string; desc?: string; action?: React.ReactNode;
}) {
  return (
    <div style={{
      textAlign: "center", padding: "40px 20px",
      background: DASH.surface2, borderRadius: 12,
      border: `1px dashed ${DASH.border}`,
    }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: DASH.text, marginBottom: 4 }}>{title}</div>
      {desc && <div style={{ fontSize: 13, color: DASH.text3, marginBottom: 14 }}>{desc}</div>}
      {action}
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────────

export function Toast({ message, type, onClose }: {
  message: string; type: "success" | "error" | "info"; onClose: () => void;
}) {
  React.useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const bgColor = type === "success" ? "#16A34A" : type === "error" ? DASH.red : DASH.blue;
  const icon = type === "success" ? "✓" : type === "error" ? "✕" : "ℹ";

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 999,
      display: "flex", alignItems: "center", gap: 10,
      padding: "12px 16px", borderRadius: 10,
      background: bgColor,
      color: "#fff", fontSize: 13.5, fontWeight: 600,
      boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      animation: "slideIn 0.2s ease",
    }}>
      {icon} {message}
      <button onClick={onClose} style={{ 
        background: "none", border: "none", cursor: "pointer", 
        color: "rgba(255,255,255,0.7)", marginLeft: 8, 
        fontSize: 16, padding: "0 4px"
      }}>×</button>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = React.useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const show = (message: string, type: "success" | "error" | "info" = "success") => setToast({ message, type });
  const hide = () => setToast(null);
  const ToastEl = toast ? <Toast message={toast.message} type={toast.type} onClose={hide} /> : null;
  return { show, ToastEl };
}

// ── Spinner ────────────────────────────────────────────────────────────────────

export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ animation: "spin 0.8s linear infinite", display: "block" }}>
      <circle cx="12" cy="12" r="10" stroke="rgba(232,105,44,0.2)" strokeWidth="3"/>
      <path d="M12 2a10 10 0 0110 10" stroke={O} strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

// ── Type and Mobility Labels ─────────────────────────────────────────────────

export const TYPE_LABELS: Record<string, string> = {
  jaw_crusher:      "Jaw Crusher",
  cone_crusher:     "Cone Crusher",
  hsi_crusher:      "HSI Crusher",
  vsi_crusher:      "VSI Crusher",
  gyratory_crusher: "Gyratory Crusher",
  screen:           "Screen",
  feeder:           "Feeder",
  conveyor:         "Conveyor",
};

export const MOBILITY_LABELS: Record<string, string> = {
  static:   "Static",
  track:    "Track-mounted",
  wheel:    "Wheel-mounted",
  portable: "Portable",
  modular:  "Modular",
};

// Add global styles for animations
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `;
  document.head.appendChild(style);
}