// FILE PATH: frontend/src/components/dashboard/equipment/EquipmentEditor.tsx

"use client";

/**
 * EquipmentEditor — StratumIQ
 * Tabbed editor for a single equipment record covering all 6 layers (A–F).
 * Used on /dashboard/equipment/[id]/edit
 */

import { useState } from "react";
import Link from "next/link";
import { BRAND, DASH } from "@/lib/constants";
import { useEquipmentSpec } from "../equipment/hooks/useEquipment";
import { Spinner, Badge, TYPE_LABELS, MOBILITY_LABELS } from "./shared/EqUI";
import TechnicalTab   from "./tabs/TechnicalTab";
import CommercialTab  from "./tabs/CommercialTab";
import OperationalTab from "./tabs/OperationalTab";
import IntelligenceTab from "./tabs/IntelligenceTab";
import MediaTab       from "./tabs/MediaTab";
import IdentityTab    from "./tabs/IdentityTab";

const O = BRAND.orange;

type TabId = "identity" | "technical" | "commercial" | "operational" | "intelligence" | "media";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "identity",     label: "Identity",      icon: "🏷️" },
  { id: "technical",    label: "Technical",     icon: "⚙️" },
  { id: "commercial",   label: "Commercial",    icon: "💼" },
  { id: "operational",  label: "Operational",   icon: "🚚" },
  { id: "intelligence", label: "Intelligence",  icon: "🧠" },
  { id: "media",        label: "Media",         icon: "📁" },
];

export default function EquipmentEditor({ equipmentId }: { equipmentId: string }) {
  const { spec, loading, error, refetch } = useEquipmentSpec(equipmentId);
  const [activeTab, setActiveTab] = useState<TabId>("identity");

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 64 }}>
        <Spinner size={32} />
      </div>
    );
  }

  if (error || !spec) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
        <div style={{ color: DASH.red, fontSize: 14, marginBottom: 12 }}>{error ?? "Equipment not found"}</div>
        <Link href="/dashboard/equipment">
          <button className="btn-secondary" style={{ height: 36, padding: "0 16px", fontSize: 13 }}>← Back to list</button>
        </Link>
      </div>
    );
  }

  const eq = spec.identity;

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Link href="/dashboard/equipment" style={{ textDecoration: "none", color: DASH.text3, fontSize: 13 }}>
            Equipment
          </Link>
          <span style={{ color: DASH.text3 }}>/</span>
          <span style={{ fontSize: 13, color: DASH.text2 }}>{eq.model_name}</span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: DASH.text, letterSpacing: "-0.03em" }}>
                {eq.brand} {eq.model_name}
              </h1>
              <Badge label={eq.status} variant={eq.status} />
            </div>
            <div style={{ fontSize: 13, color: DASH.text3, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <span>ID: <strong style={{ color: DASH.text2, fontFamily: "monospace" }}>{eq.equipment_id}</strong></span>
              <span>Type: <strong style={{ color: DASH.text2 }}>{TYPE_LABELS[eq.equipment_type] ?? eq.equipment_type}</strong></span>
              <span>Mobility: <strong style={{ color: DASH.text2 }}>{MOBILITY_LABELS[eq.mobility_type] ?? eq.mobility_type}</strong></span>
              {eq.year_introduced && <span>Year: <strong style={{ color: DASH.text2 }}>{eq.year_introduced}</strong></span>}
            </div>
          </div>
          <Link href={`/dashboard/equipment/${equipmentId}`}>
            <button className="btn-secondary" style={{ height: 36, padding: "0 16px", fontSize: 13 }}>
              View Spec Sheet →
            </button>
          </Link>
        </div>
      </div>

      {/* Tab navigation */}
      <div style={{
        display: "flex", gap: 2,
        background: DASH.surface2,
        borderRadius: 12, padding: 4,
        marginBottom: 20, flexWrap: "wrap",
        border: `1px solid ${DASH.border}`,
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, minWidth: 100, height: 36,
              borderRadius: 9, border: "none",
              background: activeTab === tab.id ? DASH.surface : "transparent",
              color: activeTab === tab.id ? DASH.text : DASH.text3,
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: 13, cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              boxShadow: activeTab === tab.id ? DASH.shadowSm : "none",
              transition: "all .15s",
              borderBottom: activeTab === tab.id ? `2px solid ${O}` : "2px solid transparent",
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "identity"     && <IdentityTab     spec={spec} onRefresh={refetch} />}
        {activeTab === "technical"    && <TechnicalTab    spec={spec} onRefresh={refetch} />}
        {activeTab === "commercial"   && <CommercialTab   spec={spec} onRefresh={refetch} />}
        {activeTab === "operational"  && <OperationalTab  spec={spec} onRefresh={refetch} />}
        {activeTab === "intelligence" && <IntelligenceTab spec={spec} onRefresh={refetch} />}
        {activeTab === "media"        && <MediaTab        spec={spec} onRefresh={refetch} />}
      </div>
    </div>
  );
}