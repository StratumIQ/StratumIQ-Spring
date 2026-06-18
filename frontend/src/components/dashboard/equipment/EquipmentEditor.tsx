"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Tag,
  Settings,
  Briefcase,
  Truck,
  Brain,
  FolderOpen,
  ExternalLink,
} from "lucide-react";
import PageShell from "../layout/PageShell";
import GlassCard from "../ui/GlassCard";
import Button from "../ui/Button";
import Tabs, { type TabItem } from "../ui/Tabs";
import Skeleton from "../ui/Skeleton";
import EmptyState from "../ui/EmptyState";
import { useEquipmentSpec } from "./hooks/useEquipment";
import { Badge, TYPE_LABELS, MOBILITY_LABELS } from "./shared/EqUI";
import TechnicalTab from "./tabs/TechnicalTab";
import CommercialTab from "./tabs/CommercialTab";
import OperationalTab from "./tabs/OperationalTab";
import IntelligenceTab from "./tabs/IntelligenceTab";
import MediaTab from "./tabs/MediaTab";
import IdentityTab from "./tabs/IdentityTab";

type TabId = "identity" | "technical" | "commercial" | "operational" | "intelligence" | "media";

const TABS: TabItem<TabId>[] = [
  { id: "identity", label: "Identity", icon: <Tag size={14} /> },
  { id: "technical", label: "Technical", icon: <Settings size={14} /> },
  { id: "commercial", label: "Commercial", icon: <Briefcase size={14} /> },
  { id: "operational", label: "Operational", icon: <Truck size={14} /> },
  { id: "intelligence", label: "Intelligence", icon: <Brain size={14} /> },
  { id: "media", label: "Media", icon: <FolderOpen size={14} /> },
];

export default function EquipmentEditor({ equipmentId }: { equipmentId: string }) {
  const { spec, loading, error, refetch } = useEquipmentSpec(equipmentId);
  const [activeTab, setActiveTab] = useState<TabId>("identity");

  if (loading) {
    return (
      <PageShell breadcrumbs={[{ label: "Equipment", href: "/dashboard/equipment" }]}>
        <Skeleton height={120} className="d-skeleton-block" />
        <Skeleton height={48} className="d-skeleton-block d-mt-sm" />
        <Skeleton height={400} className="d-skeleton-block d-mt-sm" />
      </PageShell>
    );
  }

  if (error || !spec) {
    return (
      <PageShell breadcrumbs={[{ label: "Equipment", href: "/dashboard/equipment" }]}>
        <EmptyState
          icon={Settings}
          title="Equipment not found"
          description={error ?? "This equipment record could not be loaded."}
          action={{ label: "Back to Registry", href: "/dashboard/equipment" }}
        />
      </PageShell>
    );
  }

  const eq = spec.identity;

  return (
    <PageShell
      title={`Edit ${eq.brand} ${eq.model_name}`}
      description={`${TYPE_LABELS[eq.equipment_type] ?? eq.equipment_type} · ${MOBILITY_LABELS[eq.mobility_type] ?? eq.mobility_type}`}
      breadcrumbs={[
        { label: "Equipment", href: "/dashboard/equipment" },
        { label: eq.model_name, href: `/dashboard/equipment/${equipmentId}` },
        { label: "Edit" },
      ]}
      actions={
        <Link href={`/dashboard/equipment/${equipmentId}`}>
          <Button variant="outline" size="sm" icon={<ExternalLink size={14} />}>
            View Spec Sheet
          </Button>
        </Link>
      }
    >
      <GlassCard padding="md" className="d-eq-editor-meta">
        <div className="d-eq-hero-badges">
          <Badge label={eq.status} variant={eq.status} />
          <code className="d-eq-id">{eq.equipment_id}</code>
          {eq.year_introduced && (
            <span className="d-text-muted">Year {eq.year_introduced}</span>
          )}
        </div>
      </GlassCard>

      <Tabs tabs={TABS} value={activeTab} onChange={setActiveTab} variant="line" />

      <GlassCard padding="md" className="d-tab-panel">
        {activeTab === "identity" && <IdentityTab spec={spec} onRefresh={refetch} />}
        {activeTab === "technical" && <TechnicalTab spec={spec} onRefresh={refetch} />}
        {activeTab === "commercial" && <CommercialTab spec={spec} onRefresh={refetch} />}
        {activeTab === "operational" && <OperationalTab spec={spec} onRefresh={refetch} />}
        {activeTab === "intelligence" && <IntelligenceTab spec={spec} onRefresh={refetch} />}
        {activeTab === "media" && <MediaTab spec={spec} onRefresh={refetch} />}
      </GlassCard>
    </PageShell>
  );
}
