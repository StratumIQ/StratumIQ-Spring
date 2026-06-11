"use client";

import Link from "next/link";
import { BRAND, DASH } from "@/lib/constants";

type Props = {
  module:       string;
  description?: string;
  eta?:         string;
};

const MODULE_META: Record<string, { icon: string; desc: string; features: string[]; color: string }> = {
  Fleet: {
    icon:     "🚛",
    color:    "#E8692C",
    desc:     "Add and manage your heavy equipment fleet. Track status, hours, manuals, and maintenance history for every machine.",
    features: ["Add machines with full profile", "Track hours & status", "Manuals & documents", "Chatbot per machine", "Maintenance history"],
  },
  Parts: {
    icon:     "🔩",
    color:    "#D97706",
    desc:     "Manage parts inventory across your entire fleet. Get low-stock alerts, reorder suggestions, and supplier contacts.",
    features: ["Parts catalogue", "Low stock alerts", "Reorder workflows", "Supplier management", "CSV bulk upload"],
  },
  Maintenance: {
    icon:     "🛠️",
    color:    "#2563EB",
    desc:     "Schedule and track all preventive and corrective maintenance tasks. Never miss a service interval again.",
    features: ["Preventive schedules", "Technician assignment", "Service logs", "Overdue tracking", "Cost summaries"],
  },
  Configurator: {
    icon:     "⚙️",
    color:    "#16A34A",
    desc:     "Configure crushing and screening plants intelligently. Compare specs, attachments, and get dealer quotes.",
    features: ["Brand & model selection", "Attachment configuration", "Spec comparison", "Save configurations", "Get dealer quotes"],
  },
  Alerts: {
    icon:     "🔔",
    color:    "#DC2626",
    desc:     "View all platform alerts — low inventory, overdue maintenance, fault codes, and system notifications.",
    features: ["Critical alerts", "Warning notifications", "Info updates", "Mark read / bulk clear", "Alert history"],
  },
  Settings: {
    icon:     "⚙️",
    color:    "#6B7280",
    desc:     "Manage your profile, preferences, API keys, and notification settings.",
    features: ["Profile management", "Notification settings", "API key management", "Team members", "Billing"],
  },
  Training: {
    icon:     "📚",
    color:    "#8B5CF6",
    desc:     "Access guides, tutorials, and best practices for heavy equipment operations.",
    features: ["Video tutorials", "PDF guides", "Best practices", "Operator training", "Certification"],
  },
  Solutions: {
    icon:     "📊",
    color:    "#0891B2",
    desc:     "Advanced analytics and production performance dashboards for your operation.",
    features: ["OEE analytics", "Production KPIs", "Energy monitoring", "Throughput tracking", "Custom reports"],
  },
};

export default function ComingSoon({ module, description, eta }: Props) {
  const meta = MODULE_META[module] ?? {
    icon: "🚀", color: BRAND.orange,
    desc: description ?? "This module is being built and will be available soon.",
    features: [],
  };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", paddingTop: 32 }}>

      {/* Back */}
      <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: DASH.text3, textDecoration: "none", marginBottom: 28, fontWeight: 500, transition: "color .15s" }}
        onMouseOver={e => ((e.currentTarget as HTMLElement).style.color = BRAND.orange)}
        onMouseOut={e => ((e.currentTarget as HTMLElement).style.color = DASH.text3)}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back to Dashboard
      </Link>

      {/* Card */}
      <div className="anim-in" style={{ background: DASH.surface, border: `1px solid ${DASH.border}`, borderRadius: 20, overflow: "hidden", boxShadow: DASH.shadowMd }}>

        {/* Header strip */}
        <div style={{ height: 5, background: `linear-gradient(90deg, ${meta.color}, ${meta.color}80)` }} />

        <div style={{ padding: "40px 40px 36px" }}>

          {/* Icon + title */}
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 20 }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: meta.color + "15", border: `1.5px solid ${meta.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
              {meta.icon}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: DASH.text }}>{module}</h1>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99, background: "rgba(16,163,74,0.08)", color: "#16A34A", letterSpacing: "0.08em" }}>
                  IN DEVELOPMENT
                </span>
              </div>
              <p style={{ fontSize: 13.5, color: DASH.text3, lineHeight: 1 }}>
                {eta ?? "Available in the next release"}
              </p>
            </div>
          </div>

          {/* Description */}
          <p style={{ fontSize: 15, color: DASH.text2, lineHeight: 1.75, marginBottom: 28, maxWidth: 520 }}>
            {meta.desc}
          </p>

          {/* Features */}
          {meta.features.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: DASH.text3, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
                What's coming
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
                {meta.features.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: DASH.surface2, borderRadius: 9, border: `1px solid ${DASH.border}` }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={meta.color} strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span style={{ fontSize: 12.5, color: DASH.text2, fontWeight: 500 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress bar */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: DASH.text3, fontWeight: 500 }}>Development progress</span>
              <span style={{ fontSize: 12, color: meta.color, fontWeight: 700 }}>~40%</span>
            </div>
            <div style={{ height: 6, background: DASH.surface2, borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: "40%", background: `linear-gradient(90deg, ${meta.color}, ${meta.color}90)`, borderRadius: 99, transition: "width 1s ease" }} />
            </div>
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/dashboard" style={{ textDecoration: "none" }}>
              <button style={{ padding: "10px 20px", borderRadius: 10, background: BRAND.navy, color: "#fff", border: "none", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "background .15s" }}
                onMouseOver={e => (e.currentTarget.style.background = BRAND.navyHover)}
                onMouseOut={e => (e.currentTarget.style.background = BRAND.navy)}
              >
                ← Go to Dashboard
              </button>
            </Link>
            <button style={{ padding: "10px 20px", borderRadius: 10, background: DASH.surface2, color: DASH.text2, border: `1px solid ${DASH.border}`, fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Notify me when ready
            </button>
          </div>
        </div>
      </div>

      {/* Seed prompt for empty states */}
      <div style={{ marginTop: 16, padding: "16px 20px", background: `${BRAND.orangeDim}`, border: `1px solid rgba(232,105,44,0.2)`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: BRAND.orange, marginBottom: 2 }}>Try the demo data</div>
          <div style={{ fontSize: 12.5, color: DASH.text2 }}>Load sample fleet, parts, and maintenance data to explore the platform.</div>
        </div>
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <button style={{ padding: "8px 16px", borderRadius: 8, background: BRAND.orange, color: "#fff", border: "none", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
            Load Demo →
          </button>
        </Link>
      </div>
    </div>
  );
}