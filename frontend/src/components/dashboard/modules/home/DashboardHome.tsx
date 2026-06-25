"use client";

import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import MarketingNewsSlider from "./MarketingNewsSlider";
import Link from "next/link";
import {
  Truck,
  Cpu,
  Wrench,
  Bell,
  RefreshCw,
  Sparkles,
  Activity,
  Newspaper,
  ShieldAlert,
  Plus,
  ArrowRight,
  Database,
} from "lucide-react";
import PageShell from "../../layout/PageShell";
import KpiCard from "../../common/KpiCard";
import GlassCard from "../../ui/GlassCard";
import Button from "../../ui/Button";
import Skeleton from "../../ui/Skeleton";
import MiniChart from "../../common/MiniChart";
import { dashboardApi, normalizeAlerts, type ActivityItem } from "@/lib/api/dashboard";
import { useDashUser } from "@/components/dashboard/layout/DashboardContext";
import type { AISummary, Alert, NewsItem, PredItem } from "@/types";
import { riskColor } from "@/lib/utils";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DashboardHome() {
  const user = useDashUser();
  const queryClient = useQueryClient();
  const [seeding, setSeeding] = useState(false);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["dashboard", "home"],
    queryFn: async () => {
      const [stats, aiSummary, activity, alertsRaw, predictive, news] = await Promise.all([
        dashboardApi.stats(),
        dashboardApi.aiSummary().catch(() => null),
        dashboardApi.activity().catch(() => [] as ActivityItem[]),
        dashboardApi.alerts().catch(() => []),
        dashboardApi.predictive().catch(() => [] as PredItem[]),
        dashboardApi.news().catch(() => [] as NewsItem[]),
      ]);
      return {
        stats,
        aiSummary,
        activity: Array.isArray(activity) ? activity : [],
        alerts: normalizeAlerts(alertsRaw as Alert[] | { alerts: Alert[] }),
        predictive: Array.isArray(predictive) ? predictive : [],
        news: Array.isArray(news) ? news : [],
      };
    },
  });

  const handleSeed = useCallback(async () => {
    setSeeding(true);
    try {
      await dashboardApi.seedDemo();
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    } finally {
      setSeeding(false);
    }
  }, [queryClient]);

  const now = new Date();
  const greeting =
    now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const name = user?.firstName || "Operator";

  const stats = data?.stats;
  const isEmpty = stats && stats.totalEquipment === 0;
  const chartData = [
    { value: stats?.activeEquipment ?? 0 },
    { value: (stats?.activeEquipment ?? 0) + (stats?.maintenanceEquipment ?? 0) },
    { value: stats?.totalEquipment ?? 0 },
    { value: stats?.idleEquipment ?? 0 },
    { value: stats?.activeEquipment ?? 0 },
    { value: stats?.totalEquipment ?? 0 },
  ];

  const quickActions = [
    { label: "Add Fleet Asset", href: "/dashboard/fleet/new", icon: <Truck size={15} /> },
    { label: "Register Equipment", href: "/dashboard/equipment/new", icon: <Cpu size={15} /> },
    { label: "View Alerts", href: "/dashboard/alerts", icon: <Bell size={15} /> },
    { label: "Maintenance", href: "/dashboard/maintenance", icon: <Wrench size={15} /> },
  ];

  return (
    <PageShell
      title={`${greeting}, ${name}`}
      description={now.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })}
      actions={
        <Button
          variant="outline"
          size="sm"
          icon={<RefreshCw size={14} className={isFetching ? "d-spin" : ""} />}
          onClick={() => refetch()}
          loading={isFetching && !isLoading}
        >
          Refresh
        </Button>
      }
    >
      {!isLoading && isEmpty && (
        <GlassCard className="d-seed-bar" padding="md">
          <div className="d-seed-bar-inner">
            <div className="d-seed-bar-icon">
              <Database size={20} />
            </div>
            <div>
              <div className="d-seed-bar-title">Welcome to StratumIQ</div>
              <div className="d-seed-bar-desc">Load demo data to explore the platform</div>
            </div>
          </div>
          <Button onClick={handleSeed} loading={seeding}>
            Load Demo Data
          </Button>
        </GlassCard>
      )}

      <MarketingNewsSlider />

      <GlassCard padding="lg" className="d-ai-banner">
        <div className="d-ai-banner-glow" />
        <div className="d-ai-banner-content">
          <div className="d-ai-banner-head">
            <span className="d-ai-banner-icon">
              <Sparkles size={16} />
            </span>
            <span className="d-ai-banner-label">AI Operations Summary</span>
          </div>
          {isLoading ? (
            <>
              <Skeleton height={22} width="55%" />
              <Skeleton height={14} width="75%" className="d-mt-sm" />
            </>
          ) : (
            <>
              <h2 className="d-ai-banner-title">
                {(data?.aiSummary as AISummary | null)?.headline || "Fleet Overview"}
              </h2>
              <p className="d-ai-banner-body">
                {(data?.aiSummary as AISummary | null)?.body ||
                  "All systems operational. No critical issues detected."}
              </p>
            </>
          )}
        </div>
      </GlassCard>

      <div className="d-kpi-grid">
        <KpiCard
          label="Total Equipment"
          value={stats?.totalEquipment ?? "—"}
          subText={`${stats?.activeEquipment ?? 0} active`}
          href="/dashboard/equipment"
          icon={<Cpu size={20} />}
          color="#2563EB"
          trend="up"
          trendValue="+12%"
          loading={isLoading}
        />
        <KpiCard
          label="Active Fleet"
          value={stats?.activeEquipment ?? "—"}
          subText={`${stats?.idleEquipment ?? 0} idle`}
          href="/dashboard/fleet"
          icon={<Truck size={20} />}
          color="#E8692C"
          loading={isLoading}
        />
        <KpiCard
          label="Maintenance Due"
          value={stats?.maintenanceEquipment ?? "—"}
          subText="Scheduled tasks"
          href="/dashboard/maintenance"
          icon={<Wrench size={20} />}
          color="#7C3AED"
          trend={stats && stats.maintenanceEquipment > 0 ? "down" : "neutral"}
          trendValue={stats && stats.maintenanceEquipment > 0 ? "Action needed" : "On track"}
          loading={isLoading}
        />
        <KpiCard
          label="Open Alerts"
          value={data?.alerts.length ?? "—"}
          subText={`${data?.alerts.filter((a) => !a.is_read).length ?? 0} unread`}
          href="/dashboard/alerts"
          icon={<Bell size={20} />}
          color={
            data?.alerts.some((a) => !a.is_read && a.type === "critical") ? "#DC2626" : "#E8692C"
          }
          loading={isLoading}
        />
      </div>

      <div className="d-home-grid">
        <GlassCard padding="md" className="d-home-chart-card">
          <div className="d-panel-head">
            <div>
              <h3 className="d-panel-title">Fleet Utilization</h3>
              <p className="d-panel-sub">7-day activity trend</p>
            </div>
          </div>
          {isLoading ? (
            <Skeleton height={80} />
          ) : (
            <MiniChart data={chartData} height={80} />
          )}
        </GlassCard>

        <GlassCard padding="md" className="d-quick-actions-card">
          <div className="d-panel-head">
            <h3 className="d-panel-title">Quick Actions</h3>
          </div>
          <div className="d-quick-actions">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href} className="d-quick-action">
                <span className="d-quick-action-icon">{action.icon}</span>
                <span>{action.label}</span>
                <ArrowRight size={13} className="d-quick-action-arrow" />
              </Link>
            ))}
          </div>
        </GlassCard>

        <GlassCard padding="md" className="d-panel">
          <div className="d-panel-head">
            <div className="d-panel-head-left">
              <span className="d-panel-icon">
                <ShieldAlert size={16} />
              </span>
              <div>
                <h3 className="d-panel-title">Predictive Risk</h3>
                <p className="d-panel-sub">AI-scored priority</p>
              </div>
            </div>
            <Link href="/dashboard/maintenance" className="d-panel-link">
              View all
            </Link>
          </div>
          {isLoading ? (
            <div className="d-panel-stack">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height={56} />
              ))}
            </div>
          ) : (data?.predictive.length ?? 0) === 0 ? (
            <div className="d-panel-empty">
              <ShieldAlert size={24} strokeWidth={1.5} />
              <span>No risk data</span>
            </div>
          ) : (
            <div className="d-panel-stack">
              {data!.predictive.slice(0, 4).map((item) => {
                const color = riskColor(item.riskLevel);
                return (
                  <Link key={item.id} href="/dashboard/maintenance" className="d-risk-row">
                    <div className="d-risk-score" style={{ color }}>
                      {item.riskScore}
                    </div>
                    <div className="d-risk-info">
                      <div className="d-risk-name">{item.name}</div>
                      <div className="d-risk-model">{item.model}</div>
                    </div>
                    <span className="d-badge d-badge--sm" style={{ color, background: `${color}14` }}>
                      {item.riskLevel}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </GlassCard>

        <GlassCard padding="md" className="d-panel">
          <div className="d-panel-head">
            <div className="d-panel-head-left">
              <span className="d-panel-icon">
                <Bell size={16} />
              </span>
              <div>
                <h3 className="d-panel-title">Active Alerts</h3>
                <p className="d-panel-sub">Requires attention</p>
              </div>
            </div>
            <Link href="/dashboard/alerts" className="d-panel-link">
              View all
            </Link>
          </div>
          {isLoading ? (
            <div className="d-panel-stack">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height={48} />
              ))}
            </div>
          ) : (data?.alerts.length ?? 0) === 0 ? (
            <div className="d-panel-empty d-panel-empty--success">
              <Bell size={24} strokeWidth={1.5} />
              <span>No active alerts</span>
            </div>
          ) : (
            <div className="d-panel-stack">
              {data!.alerts.slice(0, 4).map((alert) => (
                <div
                  key={alert.id}
                  className={`d-alert-row${!alert.is_read ? " unread" : ""}`}
                  data-type={alert.type}
                >
                  <div className="d-alert-row-title">{alert.title}</div>
                  <div className="d-alert-row-msg">{alert.message}</div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard padding="md" className="d-panel">
          <div className="d-panel-head">
            <div className="d-panel-head-left">
              <span className="d-panel-icon">
                <Newspaper size={16} />
              </span>
              <div>
                <h3 className="d-panel-title">Industry News</h3>
                <p className="d-panel-sub">Latest updates</p>
              </div>
            </div>
          </div>
          {isLoading ? (
            <div className="d-panel-stack">
              {[1, 2].map((i) => (
                <Skeleton key={i} height={72} />
              ))}
            </div>
          ) : (
            <div className="d-panel-stack">
              {(data?.news ?? []).slice(0, 3).map((item) => (
                <div key={item.id} className="d-news-row">
                  <div className="d-news-meta">
                    <span className="d-badge d-badge--sm" style={{ color: item.badgeColor, background: `${item.badgeColor}14` }}>
                      {item.badge}
                    </span>
                    <span className="d-news-date">
                      {new Date(item.date).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                  <div className="d-news-title">{item.title}</div>
                  <div className="d-news-summary">{item.summary}</div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard padding="md" className="d-panel d-panel--full">
          <div className="d-panel-head">
            <div className="d-panel-head-left">
              <span className="d-panel-icon">
                <Activity size={16} />
              </span>
              <div>
                <h3 className="d-panel-title">Recent Activity</h3>
                <p className="d-panel-sub">Latest actions across your workspace</p>
              </div>
            </div>
            <Link href="/dashboard/fleet" className="d-panel-link">
              <Plus size={13} /> Add asset
            </Link>
          </div>
          {isLoading ? (
            <div className="d-panel-stack">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} height={40} />
              ))}
            </div>
          ) : (data?.activity.length ?? 0) === 0 ? (
            <div className="d-panel-empty">
              <Activity size={24} strokeWidth={1.5} />
              <span>No recent activity</span>
            </div>
          ) : (
            <div className="d-activity-list">
              {data!.activity.slice(0, 6).map((item, i) => (
                <div key={i} className="d-activity-row">
                  <span className="d-activity-dot" />
                  <div className="d-activity-body">
                    <span className="d-activity-action">{item.action}</span>
                    {item.metadata?.name && (
                      <span className="d-activity-meta"> — {item.metadata.name}</span>
                    )}
                    <div className="d-activity-entity">{item.entity}</div>
                  </div>
                  <time className="d-activity-time">{timeAgo(item.created_at)}</time>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </PageShell>
  );
}
