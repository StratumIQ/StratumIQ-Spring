"use client";

import Link from "next/link";
import {
  Truck,
  Package,
  Wrench,
  SlidersHorizontal,
  Bell,
  Settings2,
  BookOpen,
  BarChart3,
  ArrowLeft,
  Check,
  type LucideIcon,
} from "lucide-react";
import PageShell from "../layout/PageShell";
import GlassCard from "../ui/GlassCard";
import Button from "../ui/Button";
import { BRAND } from "@/lib/constants";

type Props = {
  module: string;
  description?: string;
  eta?: string;
};

const MODULE_META: Record<
  string,
  { icon: LucideIcon; desc: string; features: string[]; color: string }
> = {
  Fleet: {
    icon: Truck,
    color: "#E8692C",
    desc: "Add and manage your heavy equipment fleet. Track status, hours, manuals, and maintenance history for every machine.",
    features: [
      "Add machines with full profile",
      "Track hours & status",
      "Manuals & documents",
      "Chatbot per machine",
      "Maintenance history",
    ],
  },
  Parts: {
    icon: Package,
    color: "#D97706",
    desc: "Manage parts inventory across your entire fleet. Get low-stock alerts, reorder suggestions, and supplier contacts.",
    features: [
      "Parts catalogue",
      "Low stock alerts",
      "Reorder workflows",
      "Supplier management",
      "CSV bulk upload",
    ],
  },
  Maintenance: {
    icon: Wrench,
    color: "#2563EB",
    desc: "Schedule and track all preventive and corrective maintenance tasks. Never miss a service interval again.",
    features: [
      "Preventive schedules",
      "Technician assignment",
      "Service logs",
      "Overdue tracking",
      "Cost summaries",
    ],
  },
  Configurator: {
    icon: SlidersHorizontal,
    color: "#16A34A",
    desc: "Configure crushing and screening plants intelligently. Compare specs, attachments, and get dealer quotes.",
    features: [
      "Brand & model selection",
      "Attachment configuration",
      "Spec comparison",
      "Save configurations",
      "Get dealer quotes",
    ],
  },
  Alerts: {
    icon: Bell,
    color: "#DC2626",
    desc: "View all platform alerts — low inventory, overdue maintenance, fault codes, and system notifications.",
    features: [
      "Critical alerts",
      "Warning notifications",
      "Info updates",
      "Mark read / bulk clear",
      "Alert history",
    ],
  },
  Settings: {
    icon: Settings2,
    color: "#6B7280",
    desc: "Manage your profile, preferences, API keys, and notification settings.",
    features: [
      "Profile management",
      "Notification settings",
      "API key management",
      "Team members",
      "Billing",
    ],
  },
  Training: {
    icon: BookOpen,
    color: "#8B5CF6",
    desc: "Access guides, tutorials, and best practices for heavy equipment operations.",
    features: [
      "Video tutorials",
      "PDF guides",
      "Best practices",
      "Operator training",
      "Certification",
    ],
  },
  Solutions: {
    icon: BarChart3,
    color: "#0891B2",
    desc: "Advanced analytics and production performance dashboards for your operation.",
    features: [
      "OEE analytics",
      "Production KPIs",
      "Energy monitoring",
      "Throughput tracking",
      "Custom reports",
    ],
  },
};

export default function ComingSoon({ module, description, eta }: Props) {
  const meta = MODULE_META[module] ?? {
    icon: BarChart3,
    color: BRAND.orange,
    desc: description ?? "This module is being built and will be available soon.",
    features: [] as string[],
  };
  const Icon = meta.icon;

  return (
    <PageShell
      breadcrumbs={[{ label: module }]}
      maxWidth={720}
    >
      <GlassCard padding="lg" className="d-coming-soon">
        <div
          className="d-coming-soon-accent"
          style={{ background: `linear-gradient(90deg, ${meta.color}, ${meta.color}80)` }}
        />

        <div className="d-coming-soon-header">
          <div className="d-coming-soon-icon" style={{ color: meta.color, background: `${meta.color}14`, borderColor: `${meta.color}30` }}>
            <Icon size={26} strokeWidth={1.5} />
          </div>
          <div>
            <div className="d-coming-soon-title-row">
              <h1 className="d-coming-soon-title">{module}</h1>
              <span className="d-badge d-badge--success d-badge--sm">In Development</span>
            </div>
            <p className="d-coming-soon-eta">{eta ?? "Available in the next release"}</p>
          </div>
        </div>

        <p className="d-coming-soon-desc">{meta.desc}</p>

        {meta.features.length > 0 && (
          <div className="d-coming-soon-features">
            <div className="d-coming-soon-features-label">What&apos;s coming</div>
            <div className="d-coming-soon-features-grid">
              {meta.features.map((f) => (
                <div key={f} className="d-coming-soon-feature">
                  <Check size={13} style={{ color: meta.color }} strokeWidth={2.5} />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="d-coming-soon-progress">
          <div className="d-coming-soon-progress-head">
            <span>Development progress</span>
            <span style={{ color: meta.color }}>~40%</span>
          </div>
          <div className="d-coming-soon-progress-track">
            <div
              className="d-coming-soon-progress-bar"
              style={{ background: `linear-gradient(90deg, ${meta.color}, ${meta.color}90)` }}
            />
          </div>
        </div>

        <div className="d-coming-soon-actions">
          <Link href="/dashboard">
            <Button variant="secondary" icon={<ArrowLeft size={14} />}>
              Go to Dashboard
            </Button>
          </Link>
          <Button variant="outline">Notify me when ready</Button>
        </div>
      </GlassCard>

      <GlassCard padding="md" className="d-seed-bar">
        <div className="d-seed-bar-inner">
          <div>
            <div className="d-seed-bar-title" style={{ color: BRAND.orange }}>
              Try the demo data
            </div>
            <div className="d-seed-bar-desc">
              Load sample fleet, parts, and maintenance data to explore the platform.
            </div>
          </div>
        </div>
        <Link href="/dashboard">
          <Button size="sm">Load Demo</Button>
        </Link>
      </GlassCard>
    </PageShell>
  );
}
