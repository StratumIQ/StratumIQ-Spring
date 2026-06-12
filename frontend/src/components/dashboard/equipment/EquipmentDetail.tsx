"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Pencil,
  Cpu,
  Settings,
  ImageIcon,
  Wrench,
  BarChart3,
  Activity,
  User,
  Clock,
} from "lucide-react";
import PageShell from "../layout/PageShell";
import GlassCard from "../ui/GlassCard";
import Button from "../ui/Button";
import Tabs, { type TabItem } from "../ui/Tabs";
import Skeleton from "../ui/Skeleton";
import EmptyState from "../ui/EmptyState";
import { useEquipmentSpec } from "./hooks/useEquipment";
import { Badge, TYPE_LABELS, MOBILITY_LABELS } from "./shared/EqUI";
import type { EquipmentSpec } from "@/types/equipment";

type TabId = "overview" | "technical" | "media" | "service" | "analytics";

const TABS: TabItem<TabId>[] = [
  { id: "overview", label: "Overview", icon: <Cpu size={14} /> },
  { id: "technical", label: "Technical", icon: <Settings size={14} /> },
  { id: "media", label: "Media", icon: <ImageIcon size={14} /> },
  { id: "service", label: "Service", icon: <Wrench size={14} /> },
  { id: "analytics", label: "Analytics", icon: <BarChart3 size={14} /> },
];

function SpecRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "" || value === "—") return null;
  return (
    <div className="d-spec-row">
      <span className="d-spec-label">{label}</span>
      <span className="d-spec-value">{value}</span>
    </div>
  );
}

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <GlassCard padding="md" className="d-spec-section">
      <div className="d-spec-section-head">
        <span className="d-panel-icon">{icon}</span>
        <h3 className="d-panel-title">{title}</h3>
      </div>
      <div className="d-spec-section-body">{children}</div>
    </GlassCard>
  );
}

function OverviewTab({ spec }: { spec: EquipmentSpec }) {
  const eq = spec.identity;
  const t = spec.technical?.master;

  return (
    <div className="d-spec-grid">
      <SectionCard title="Identity" icon={<Cpu size={16} />}>
        <SpecRow label="Equipment ID" value={<code>{eq.equipment_id}</code>} />
        <SpecRow label="Type" value={TYPE_LABELS[eq.equipment_type] ?? eq.equipment_type} />
        <SpecRow label="Mobility" value={MOBILITY_LABELS[eq.mobility_type] ?? eq.mobility_type} />
        <SpecRow label="Brand" value={eq.brand} />
        <SpecRow label="OEM ID" value={eq.oem_id} />
        <SpecRow label="Series" value={eq.series} />
        <SpecRow label="Year Introduced" value={eq.year_introduced} />
        <SpecRow label="Application Stage" value={eq.application_stage} />
        <SpecRow label="Status" value={<Badge label={eq.status} variant={eq.status} />} />
      </SectionCard>

      {t && (
        <SectionCard title="Key Metrics" icon={<Activity size={16} />}>
          <div className="d-kpi-inline-grid">
            {t.capacity_tph_min && t.capacity_tph_max && (
              <div className="d-kpi-inline">
                <div className="d-kpi-inline-value">{t.capacity_tph_min}–{t.capacity_tph_max}</div>
                <div className="d-kpi-inline-label">TPH Capacity</div>
              </div>
            )}
            {t.power_kw && (
              <div className="d-kpi-inline">
                <div className="d-kpi-inline-value">{t.power_kw}</div>
                <div className="d-kpi-inline-label">kW Power</div>
              </div>
            )}
            {t.max_feed_size_mm && (
              <div className="d-kpi-inline">
                <div className="d-kpi-inline-value">{t.max_feed_size_mm}</div>
                <div className="d-kpi-inline-label">mm Max Feed</div>
              </div>
            )}
            {t.weight_kg && (
              <div className="d-kpi-inline">
                <div className="d-kpi-inline-value">{(t.weight_kg / 1000).toFixed(0)}t</div>
                <div className="d-kpi-inline-label">Weight</div>
              </div>
            )}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function TechnicalTab({ spec }: { spec: EquipmentSpec }) {
  const t = spec.technical?.master;
  const su = spec.intelligence?.suitability;

  return (
    <div className="d-spec-grid">
      {t && (
        <SectionCard title="Technical Specifications" icon={<Settings size={16} />}>
          <SpecRow label="Drive Type" value={t.drive_type} />
          <SpecRow label="Engine Model" value={t.engine_model} />
          <SpecRow label="Power (kW)" value={t.power_kw} />
          <SpecRow label="Weight (kg)" value={t.weight_kg?.toLocaleString()} />
          <SpecRow label="Max Feed (mm)" value={t.max_feed_size_mm} />
          <SpecRow
            label="Capacity (tph)"
            value={
              t.capacity_tph_min && t.capacity_tph_max
                ? `${t.capacity_tph_min} – ${t.capacity_tph_max}`
                : undefined
            }
          />
          <SpecRow label="Fuel Eff. (L/h)" value={t.fuel_efficiency_lph} />
          <SpecRow label="Op Cost ($/t)" value={t.operating_cost_per_ton} />
          <SpecRow label="Wear Cost ($/t)" value={t.wear_cost_per_ton} />
        </SectionCard>
      )}

      {spec.technical?.performance && spec.technical.performance.length > 0 && (
        <SectionCard title="Performance Curves" icon={<BarChart3 size={16} />}>
          <div className="d-data-table-wrap">
            <table className="d-data-table">
              <thead>
                <tr>
                  <th>Feed (mm)</th>
                  <th>CSS (mm)</th>
                  <th>Capacity (tph)</th>
                  <th>Power (kW)</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {spec.technical.performance.map((r, i) => (
                  <tr key={i}>
                    <td>{r.feed_size_mm ?? "—"}</td>
                    <td>{r.css_mm ?? "—"}</td>
                    <td>
                      {r.capacity_tph_min != null && r.capacity_tph_max != null
                        ? `${r.capacity_tph_min}–${r.capacity_tph_max}`
                        : "—"}
                    </td>
                    <td>{r.power_draw_kw ?? "—"}</td>
                    <td>{r.notes ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {su && (
        <SectionCard title="Application Suitability" icon={<Activity size={16} />}>
          <div className="d-tag-list">
            {[
              su.hard_rock && "Hard Rock",
              su.soft_rock && "Soft Rock",
              su.limestone && "Limestone",
              su.river_gravel && "River Gravel",
              su.sand_gravel && "Sand & Gravel",
              su.recycling && "Recycling",
              su.wet_feed && "Wet Feed",
              su.high_moisture && "High Moisture",
              su.primary_stage && "Primary Stage",
              su.secondary_stage && "Secondary Stage",
              su.tertiary_stage && "Tertiary Stage",
            ]
              .filter(Boolean)
              .map((label) => (
                <span key={label as string} className="d-badge d-badge--success d-badge--sm">
                  {label as string}
                </span>
              ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function MediaTab({ spec }: { spec: EquipmentSpec }) {
  const media = spec.media ?? [];

  if (media.length === 0) {
    return (
      <EmptyState
        icon={ImageIcon}
        title="No media assets"
        description="Upload images, diagrams, or documents from the editor."
        action={{
          label: "Add Media",
          href: `/dashboard/equipment/${spec.identity.equipment_id}/edit`,
        }}
      />
    );
  }

  return (
    <div className="d-media-grid">
      {media.map((m) => (
        <GlassCard key={m.id} padding="none" hover className="d-media-card">
          {m.file_url ? (
            <img src={m.file_url} alt={m.file_name ?? m.media_type} className="d-media-img" />
          ) : (
            <div className="d-media-placeholder">
              <ImageIcon size={32} strokeWidth={1.25} />
            </div>
          )}
          <div className="d-media-meta">
            <div className="d-media-title">{m.file_name ?? m.media_type}</div>
            {m.description && <div className="d-media-caption">{m.description}</div>}
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

function ServiceTab({ spec }: { spec: EquipmentSpec }) {
  const tasks = spec.technical?.maintenance ?? [];

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={Wrench}
        title="No service records"
        description="Maintenance tasks and service intervals can be configured in the editor."
        action={{
          label: "Configure Service",
          href: `/dashboard/equipment/${spec.identity.equipment_id}/edit`,
        }}
      />
    );
  }

  return (
    <div className="d-activity-list">
      {tasks.map((task) => (
        <div key={task.id} className="d-service-row">
          <div className="d-service-icon">
            <Wrench size={16} />
          </div>
          <div className="d-service-body">
            <div className="d-service-title">{task.task_name}</div>
            <div className="d-service-meta">
              {task.interval_hours && (
                <span>
                  <Clock size={11} /> Every {task.interval_hours} hrs
                </span>
              )}
              {task.interval_days && <span>Every {task.interval_days} days</span>}
              {task.duration_hours && <span>{task.duration_hours}h duration</span>}
            </div>
            {task.notes && <div className="d-service-desc">{task.notes}</div>}
          </div>
          {task.skill_level && (
            <div className="d-service-cost">
              <User size={12} /> {task.skill_level}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function AnalyticsTab({ spec }: { spec: EquipmentSpec }) {
  const ra = spec.intelligence?.ratings;
  const benchmarks = spec.intelligence?.benchmarks ?? [];
  const reviews = spec.intelligence?.reviews ?? [];

  return (
    <div className="d-spec-grid">
      {ra?.overall_score && (
        <SectionCard title="Ratings" icon={<BarChart3 size={16} />}>
          <div className="d-rating-hero">
            <div className="d-rating-score">{ra.overall_score}</div>
            <div className="d-rating-label">Overall Score (out of 5)</div>
          </div>
          <SpecRow label="Fuel Efficiency" value={ra.fuel_efficiency?.replace(/_/g, " ")} />
          <SpecRow label="Engine" value={ra.engine_rating?.replace(/_/g, " ")} />
          <SpecRow label="Maintenance" value={ra.maintenance_simplicity?.replace(/_/g, " ")} />
          <SpecRow label="Reliability" value={ra.reliability?.replace(/_/g, " ")} />
          <SpecRow label="Parts Availability" value={ra.parts_availability?.replace(/_/g, " ")} />
          <SpecRow label="TCO" value={ra.tco_rating} />
        </SectionCard>
      )}

      {benchmarks.length > 0 && (
        <SectionCard title="Benchmarks" icon={<Activity size={16} />}>
          {benchmarks.map((b) => (
            <SpecRow
              key={b.id}
              label={b.parameter}
              value={
                b.our_value != null
                  ? `${b.our_value}${b.unit ? ` ${b.unit}` : ""} vs ${b.competitor_model}`
                  : b.competitor_model
              }
            />
          ))}
        </SectionCard>
      )}

      {reviews.length > 0 && (
        <SectionCard title={`Operator Reviews (${reviews.length})`} icon={<User size={16} />}>
          <div className="d-review-list">
            {reviews.map((r, idx) => (
              <div key={r.id ?? idx} className="d-review-card">
                <div className="d-review-stars">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span
                      key={i}
                      className={i <= r.rating ? "d-star filled" : "d-star"}
                      aria-hidden
                    >
                      ★
                    </span>
                  ))}
                  {r.site_type && <span className="d-review-site">{r.site_type}</span>}
                </div>
                {r.review_text && <p className="d-review-text">{r.review_text}</p>}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {!ra?.overall_score && benchmarks.length === 0 && reviews.length === 0 && (
        <EmptyState
          icon={BarChart3}
          title="No analytics data"
          description="Ratings and benchmarks can be added in the intelligence tab of the editor."
        />
      )}
    </div>
  );
}

export default function EquipmentDetail({ equipmentId }: { equipmentId: string }) {
  const { spec, loading, error } = useEquipmentSpec(equipmentId);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  if (loading) {
    return (
      <PageShell breadcrumbs={[{ label: "Equipment", href: "/dashboard/equipment" }]}>
        <Skeleton height={200} className="d-skeleton-block" />
        <Skeleton height={48} className="d-skeleton-block d-mt-sm" />
        <Skeleton height={320} className="d-skeleton-block d-mt-sm" />
      </PageShell>
    );
  }

  if (error || !spec) {
    return (
      <PageShell breadcrumbs={[{ label: "Equipment", href: "/dashboard/equipment" }]}>
        <EmptyState
          icon={Cpu}
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
      title={`${eq.brand} ${eq.model_name}`}
      description={`${TYPE_LABELS[eq.equipment_type] ?? eq.equipment_type} · ${MOBILITY_LABELS[eq.mobility_type] ?? eq.mobility_type}`}
      breadcrumbs={[
        { label: "Equipment", href: "/dashboard/equipment" },
        { label: eq.model_name },
      ]}
      actions={
        <Link href={`/dashboard/equipment/${equipmentId}/edit`}>
          <Button icon={<Pencil size={15} />}>Edit Equipment</Button>
        </Link>
      }
    >
      <GlassCard padding="lg" className="d-eq-hero">
        <div className="d-eq-hero-inner">
          <div>
            <div className="d-eq-hero-type">
              {TYPE_LABELS[eq.equipment_type]} · {MOBILITY_LABELS[eq.mobility_type]}
            </div>
            <div className="d-eq-hero-badges">
              <Badge label={eq.status} variant={eq.status} />
              {eq.hard_rock_rated && <Badge label="Hard Rock Rated" variant="positive" />}
              <code className="d-eq-id">{eq.equipment_id}</code>
            </div>
          </div>
        </div>
      </GlassCard>

      <Tabs tabs={TABS} value={activeTab} onChange={setActiveTab} variant="line" />

      <GlassCard padding="md" className="d-tab-panel">
        {activeTab === "overview" && <OverviewTab spec={spec} />}
        {activeTab === "technical" && <TechnicalTab spec={spec} />}
        {activeTab === "media" && <MediaTab spec={spec} />}
        {activeTab === "service" && <ServiceTab spec={spec} />}
        {activeTab === "analytics" && <AnalyticsTab spec={spec} />}
      </GlassCard>
    </PageShell>
  );
}
