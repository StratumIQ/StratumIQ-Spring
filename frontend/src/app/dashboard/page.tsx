"use client";

/**
 * Dashboard Home — StratumIQ
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { dashFetch, getToken } from "@/lib/utils";
import { API_URL, BRAND } from "@/lib/constants";
import type { AISummary, PredItem, NewsItem, Alert } from "@/types";

/* ─── DESIGN TOKENS ──────────────────────────────────────────── */
const D = {
  bg:       "var(--d-bg)",
  surface:  "var(--d-surface)",
  surface2: "var(--d-surface2)",
  text:     "var(--d-text)",
  text2:    "var(--d-text2)",
  text3:    "var(--d-text3)",
  border:   "var(--d-border)",
  border2:  "var(--d-border2)",
  orange:   "#E8692C",
  red:      "#DC2626",
  amber:    "#D97706",
  green:    "#16A34A",
  blue:     "#2563EB",
  purple:   "#7C3AED",
  cyan:     "#0891B2",
} as const;

/* ─── ICONS ──────────────────────────────────────────────────── */
const Icons = {
  Fleet: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="4" width="14" height="12" rx="2" />
      <path d="M16 8h3l3 3v5h-6V8z" />
      <circle cx="5" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  ),
  Parts: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  Maintenance: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Alerts: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Activity: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  News: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z" />
    </svg>
  ),
  Predict: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  Production: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  ArrowRight: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
  Refresh: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  ),
  Sparkles: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3L14 8L19 10L14 12L12 17L10 12L5 10L10 8L12 3Z" />
      <path d="M19 4L20 7L23 8L20 9L19 12L18 9L15 8L18 7L19 4Z" />
    </svg>
  ),
  Warning: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Seed: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22V12M12 12C12 7 7 3 2 3c0 5 4 9 10 9zM12 12c0-5 5-9 10-9-1 5-5 9-10 9" />
    </svg>
  ),
};

/* ─── TYPES ─────────────────────────────────────────────────── */
interface DashboardStats {
  totalEquipment: number;
  activeEquipment: number;
  maintenanceEquipment: number;
  idleEquipment: number;
}

type ActivityItem = {
  action: string;
  entity: string;
  entity_id: number;
  metadata: Record<string, string>;
  created_at: string;
};

/* ─── SKELETON ──────────────────────────────────────────────── */
function Skeleton({ w = "100%", h = 16, r = 8 }: { w?: string | number; h?: number; r?: number }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: r }} />;
}

/* ─── STAT CARD ─────────────────────────────────────────────── */
function StatCard({
  icon,
  label,
  value,
  subText,
  href,
  color = D.orange,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subText: string;
  href: string;
  color?: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div style={{
        background: D.surface,
        borderRadius: 16,
        padding: "20px",
        border: `1px solid ${D.border}`,
        transition: "all 0.2s ease",
        cursor: "pointer",
        height: "100%",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${color}40`; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = D.border; e.currentTarget.style.transform = "translateY(0)"; }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: `${color}12`,
            border: `1px solid ${color}25`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: color,
          }}>
            {icon}
          </div>
          <Icons.ArrowRight />
        </div>
        <div>
          <div style={{
            fontSize: 28,
            fontWeight: 800,
            color: D.text,
            letterSpacing: "-0.04em",
            fontFamily: "var(--font-heading), sans-serif",
            lineHeight: 1,
            marginBottom: 4,
          }}>
            {value}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: D.text2, marginBottom: 8 }}>{label}</div>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "3px 10px",
            borderRadius: 99,
            fontSize: 11,
            fontWeight: 600,
            background: `${D.text3}12`,
            color: D.text3,
            border: `1px solid ${D.text3}20`,
          }}>
            {subText}
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── AI SUMMARY BANNER ─────────────────────────────────────── */
function AISummaryBanner({ data, loading }: { data: AISummary | null; loading: boolean }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${D.surface} 0%, ${D.surface2} 100%)`,
      borderRadius: 20,
      padding: "24px",
      border: `1px solid ${D.border}`,
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${D.orange}15, transparent)`, pointerEvents: "none" }} />
      
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: "rgba(232,105,44,0.15)",
            border: "1px solid rgba(232,105,44,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: D.orange,
          }}>
            <Icons.Sparkles />
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: D.text3, textTransform: "uppercase" }}>AI Operations Summary</span>
        </div>

        {loading ? (
          <div><Skeleton h={24} w="60%" /><Skeleton h={16} w="80%" style={{ marginTop: 8 }} /></div>
        ) : (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: D.text, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
              {data?.headline || "Fleet Overview"}
            </h2>
            <p style={{ fontSize: 13.5, color: D.text2, lineHeight: 1.6, margin: 0 }}>
              {data?.body || "All systems operational. No critical issues detected."}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── ACTIVITY PANEL ────────────────────────────────────────── */
function ActivityPanel({ data, loading }: { data: ActivityItem[]; loading: boolean }) {
  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div style={{ background: D.surface, borderRadius: 16, padding: "20px", border: `1px solid ${D.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(232,105,44,0.1)", border: "1px solid rgba(232,105,44,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: D.orange }}><Icons.Activity /></div>
        <div><h3 style={{ fontSize: 15, fontWeight: 700, color: D.text, margin: 0 }}>Recent Activity</h3><p style={{ fontSize: 11.5, color: D.text3, margin: "2px 0 0" }}>Latest actions</p></div>
      </div>
      
      {loading ? (
        <div>{[...Array(3)].map((_, i) => <Skeleton key={i} h={40} r={8} style={{ marginBottom: 8 }} />)}</div>
      ) : data.length === 0 ? (
        <div style={{ textAlign: "center", padding: "30px 0", color: D.text3 }}><div style={{ fontSize: 40, marginBottom: 8 }}>📋</div><div style={{ fontSize: 13 }}>No recent activity</div></div>
      ) : (
        <div>
          {data.slice(0, 5).map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: i < 4 ? `1px solid ${D.border2}` : "none" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", marginTop: 6, background: D.orange }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, color: D.text }}><span style={{ fontWeight: 700 }}>{item.action}</span>{item.metadata?.name && <span style={{ color: D.text3 }}> — {item.metadata.name}</span>}</div>
                <div style={{ fontSize: 11, color: D.text3, marginTop: 2 }}>{item.entity}</div>
              </div>
              <div style={{ fontSize: 11, color: D.text3 }}>{timeAgo(item.created_at)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── NEWS PANEL ────────────────────────────────────────────── */
function NewsPanel({ data, loading }: { data: NewsItem[]; loading: boolean }) {
  return (
    <div style={{ background: D.surface, borderRadius: 16, padding: "20px", border: `1px solid ${D.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(232,105,44,0.1)", border: "1px solid rgba(232,105,44,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: D.orange }}><Icons.News /></div>
        <div><h3 style={{ fontSize: 15, fontWeight: 700, color: D.text, margin: 0 }}>Industry News</h3><p style={{ fontSize: 11.5, color: D.text3, margin: "2px 0 0" }}>Latest updates</p></div>
      </div>
      
      {loading ? (
        <div>{[...Array(2)].map((_, i) => <Skeleton key={i} h={70} r={10} style={{ marginBottom: 10 }} />)}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {data.slice(0, 3).map((item) => (
            <div key={item.id} style={{ padding: "12px", borderRadius: 10, background: D.surface2, border: `1px solid ${D.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: `${item.badgeColor}15`, color: item.badgeColor }}>{item.badge}</span>
                <span style={{ fontSize: 10.5, color: D.text3 }}>{new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: D.text, marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 11.5, color: D.text3 }}>{item.summary}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── PREDICTIVE PANEL ──────────────────────────────────────── */
const RISK_COLOR: Record<string, string> = { critical: "#DC2626", high: "#D97706", medium: "#CA8A04", low: "#16A34A" };

function PredictivePanel({ data, loading }: { data: PredItem[]; loading: boolean }) {
  return (
    <div style={{ background: D.surface, borderRadius: 16, padding: "20px", border: `1px solid ${D.border}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(232,105,44,0.1)", border: "1px solid rgba(232,105,44,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: D.orange }}><Icons.Predict /></div>
          <div><h3 style={{ fontSize: 15, fontWeight: 700, color: D.text, margin: 0 }}>Predictive Risk</h3><p style={{ fontSize: 11.5, color: D.text3, margin: "2px 0 0" }}>AI-scored priority</p></div>
        </div>
        <Link href="/dashboard/maintenance" style={{ fontSize: 12, color: D.orange, textDecoration: "none", fontWeight: 600 }}>View all →</Link>
      </div>
      
      {loading ? (
        <div>{[...Array(3)].map((_, i) => <Skeleton key={i} h={60} r={10} style={{ marginBottom: 8 }} />)}</div>
      ) : data.length === 0 ? (
        <div style={{ textAlign: "center", padding: "30px 0", color: D.text3 }}><div style={{ fontSize: 40, marginBottom: 8 }}>🛡️</div><div style={{ fontSize: 13 }}>No risk data</div></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {data.slice(0, 4).map((item) => {
            const color = RISK_COLOR[item.riskLevel] || D.text3;
            return (
              <Link key={item.id} href="/dashboard/maintenance" style={{ textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", borderRadius: 10, background: D.surface2, border: `1px solid ${D.border}` }}>
                  <div style={{ position: "relative", width: 44, height: 44 }}>
                    <svg width="44" height="44" viewBox="0 0 44 44">
                      <circle cx="22" cy="22" r="18" fill="none" stroke={`${color}20`} strokeWidth="3" />
                      <circle cx="22" cy="22" r="18" fill="none" stroke={color} strokeWidth="3" strokeDasharray={`${(item.riskScore / 100) * 113} 113`} strokeLinecap="round" transform="rotate(-90 22 22)" />
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: color }}>{item.riskScore}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: D.text }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: D.text3 }}>{item.model}</div>
                  </div>
                  <div style={{ padding: "3px 10px", borderRadius: 99, fontSize: 10.5, fontWeight: 700, background: `${color}15`, color: color, textTransform: "capitalize" }}>{item.riskLevel}</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── ALERTS PANEL ──────────────────────────────────────────── */
function AlertsPanel({ data, loading }: { data: Alert[]; loading: boolean }) {
  return (
    <div style={{ background: D.surface, borderRadius: 16, padding: "20px", border: `1px solid ${D.border}` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(232,105,44,0.1)", border: "1px solid rgba(232,105,44,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: D.orange }}><Icons.Alerts /></div>
          <div><h3 style={{ fontSize: 15, fontWeight: 700, color: D.text, margin: 0 }}>Active Alerts</h3><p style={{ fontSize: 11.5, color: D.text3, margin: "2px 0 0" }}>Requires attention</p></div>
        </div>
        <Link href="/dashboard/alerts" style={{ fontSize: 12, color: D.orange, textDecoration: "none", fontWeight: 600 }}>View all →</Link>
      </div>
      
      {loading ? (
        <div>{[...Array(3)].map((_, i) => <Skeleton key={i} h={50} r={10} style={{ marginBottom: 8 }} />)}</div>
      ) : data.length === 0 ? (
        <div style={{ textAlign: "center", padding: "30px 0", color: D.text3 }}><div style={{ fontSize: 40, marginBottom: 8 }}>✅</div><div style={{ fontSize: 13 }}>No active alerts</div></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {data.slice(0, 4).map((alert) => (
            <div key={alert.id} style={{ display: "flex", gap: 10, padding: "10px", borderRadius: 10, background: alert.is_read ? D.surface2 : `${D.red}08`, borderLeft: `3px solid ${alert.type === "critical" ? D.red : D.amber}` }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `${alert.type === "critical" ? D.red : D.amber}12`, display: "flex", alignItems: "center", justifyContent: "center", color: alert.type === "critical" ? D.red : D.amber }}><Icons.Warning /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: alert.is_read ? 500 : 700, color: D.text }}>{alert.title}</div>
                <div style={{ fontSize: 11, color: D.text3 }}>{alert.message}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── SEED DEMO BAR ─────────────────────────────────────────── */
function SeedDemoBar({ onSeed, seeding }: { onSeed: () => void; seeding: boolean }) {
  return (
    <div style={{ background: `linear-gradient(135deg, ${D.surface} 0%, ${D.surface2} 100%)`, borderRadius: 14, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, border: `1px solid ${D.border}`, marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(232,105,44,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: D.orange }}><Icons.Seed /></div>
        <div><div style={{ fontSize: 14, fontWeight: 700, color: D.text }}>Welcome to StratumIQ</div><div style={{ fontSize: 12, color: D.text3 }}>Load demo data to explore the platform</div></div>
      </div>
      <button onClick={onSeed} disabled={seeding} style={{ padding: "8px 20px", borderRadius: 10, background: D.orange, color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: seeding ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6 }}>{seeding ? "Loading..." : "Load Demo Data →"}</button>
    </div>
  );
}

/* ─── PAGE HEADER ───────────────────────────────────────────── */
function PageHeader({ onRefresh, refreshing }: { onRefresh: () => void; refreshing: boolean }) {
  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: D.text, letterSpacing: "-0.04em", margin: 0, fontFamily: "var(--font-heading), sans-serif" }}>{greeting}, <span style={{ color: D.orange }}>Operator</span> 👋</h1>
        <p style={{ fontSize: 13.5, color: D.text3, margin: "4px 0 0" }}>{now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
      </div>
      <button onClick={onRefresh} disabled={refreshing} style={{ padding: "8px 16px", borderRadius: 10, background: D.surface, border: `1px solid ${D.border}`, color: D.text2, fontSize: 12.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}><span style={{ animation: refreshing ? "spin 0.8s linear infinite" : "none" }}><Icons.Refresh /></span>{refreshing ? "Refreshing..." : "Refresh"}</button>
    </div>
  );
}

/* ─── MAIN PAGE ─────────────────────────────────────────────── */
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [aiSummary, setAISummary] = useState<AISummary | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [predictive, setPredictive] = useState<PredItem[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      const [statsRes, aiRes, activityRes, alertsRes, predictiveRes, newsRes] = await Promise.all([
        dashFetch<DashboardStats>("/dashboard/stats"),
        dashFetch<AISummary>("/dashboard/ai-summary").catch(() => null),
        dashFetch<ActivityItem[]>("/dashboard/activity").catch(() => []),
        dashFetch<Alert[]>("/dashboard/alerts").catch(() => []),
        dashFetch<PredItem[]>("/dashboard/predictive").catch(() => []),
        dashFetch<NewsItem[]>("/dashboard/news").catch(() => []),
      ]);
      setStats(statsRes);
      setAISummary(aiRes);
      setActivity(Array.isArray(activityRes) ? activityRes : []);
      setAlerts(Array.isArray(alertsRes) ? alertsRes : []);
      setPredictive(Array.isArray(predictiveRes) ? predictiveRes : []);
      setNews(Array.isArray(newsRes) ? newsRes : []);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleSeedDemo = async () => {
    setSeeding(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/dashboard/seed-demo`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.ok) { setSeeded(true); setTimeout(() => handleRefresh(), 500); }
    } catch (err) { console.error(err); }
    finally { setSeeding(false); }
  };

  const isEmpty = stats && (stats.totalEquipment === 0);

  const kpiCards = stats ? [
    { icon: <Icons.Fleet />, label: "Fleet Machines", value: stats.totalEquipment, subText: `${stats.activeEquipment} active · ${stats.maintenanceEquipment} in maintenance`, href: "/dashboard/fleet", color: D.blue },
    { icon: <Icons.Parts />, label: "Parts Inventory", value: 0, subText: "Coming soon", href: "/dashboard/parts", color: D.cyan },
    { icon: <Icons.Maintenance />, label: "Maintenance Tasks", value: 0, subText: "Coming soon", href: "/dashboard/maintenance", color: D.purple },
    { icon: <Icons.Alerts />, label: "Active Alerts", value: alerts.length, subText: `${alerts.filter(a => !a.is_read).length} unread`, href: "/dashboard/alerts", color: alerts.filter(a => !a.is_read && a.type === "critical").length > 0 ? D.red : D.orange },
  ] : [];

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fade-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .dash-anim { animation: fade-up 0.4s ease-out both; }
        .dash-anim-1 { animation-delay: 0.05s; }
        .dash-anim-2 { animation-delay: 0.1s; }
        .dash-anim-3 { animation-delay: 0.15s; }
        .dash-anim-4 { animation-delay: 0.2s; }
        .dash-anim-5 { animation-delay: 0.25s; }
        @media (max-width: 1024px) { .grid-kpi { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 768px) { .grid-kpi { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 0 20px" }}>
        <div className="dash-anim"><PageHeader onRefresh={handleRefresh} refreshing={refreshing} /></div>

        {!loading && isEmpty && !seeded && (
          <div className="dash-anim dash-anim-1"><SeedDemoBar onSeed={handleSeedDemo} seeding={seeding} /></div>
        )}

        <div className="dash-anim dash-anim-1" style={{ marginBottom: 24 }}><AISummaryBanner data={aiSummary} loading={loading} /></div>

        <div className="grid-kpi dash-anim dash-anim-2" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {loading ? [...Array(4)].map((_, i) => (<div key={i} style={{ background: D.surface, borderRadius: 16, padding: "20px", border: `1px solid ${D.border}` }}><Skeleton h={44} w={44} r={12} /><div style={{ marginTop: 16 }}><Skeleton h={28} w="50%" /></div><div style={{ marginTop: 8 }}><Skeleton h={13} w="70%" /></div><div style={{ marginTop: 12 }}><Skeleton h={22} w="60%" r={99} /></div></div>)) : kpiCards.map((card, i) => (<StatCard key={i} {...card} />))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 20 }}>
          <div className="dash-anim dash-anim-4" style={{ gridColumn: "span 4" }}><PredictivePanel data={predictive} loading={loading} /></div>
          <div className="dash-anim dash-anim-5" style={{ gridColumn: "span 4" }}><AlertsPanel data={alerts} loading={loading} /></div>
          <div className="dash-anim dash-anim-5" style={{ gridColumn: "span 4" }}><NewsPanel data={news} loading={loading} /></div>
          <div className="dash-anim dash-anim-4" style={{ gridColumn: "span 12" }}><ActivityPanel data={activity} loading={loading} /></div>
        </div>

        <style>{`@media (max-width: 1024px) { div[style*="gridTemplateColumns: repeat(12, 1fr)"] > div { grid-column: span 12 !important; } }`}</style>
      </div>
    </>
  );
}