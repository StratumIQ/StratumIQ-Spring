"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Clock,
  FileDown,
  Headphones,
  LogIn,
  Search,
  Truck,
  Upload,
  UsersRound,
} from "lucide-react";
import { adminApi } from "@/services/admin/adminClient";
import type {
  AdminActivity,
  AdminActivitySummary,
  PaginatedActivities,
} from "@/types/admin";

const ACTION_OPTIONS = [
  { value: "all", label: "All actions" },
  { value: "USER_LOGIN", label: "User Login" },
  { value: "USER_LOGOUT", label: "User Logout" },
  { value: "EQUIPMENT_ADDED", label: "Added Equipment" },
  { value: "EQUIPMENT_EDITED", label: "Edited Equipment" },
  { value: "DOCUMENT_UPLOADED", label: "Uploaded Document" },
  { value: "REPORT_DOWNLOADED", label: "Downloaded Report" },
  { value: "CONFIGURATOR_OPENED", label: "Opened Configurator" },
  { value: "SUPPORT_REQUEST_SUBMITTED", label: "Submitted Support Request" },
];

const DAYS_OPTIONS = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "365", label: "365 days" },
  { value: "custom", label: "Custom dates" },
];

const REQUIRED_ACTIONS = {
  "USER_LOGIN": "User Login",
  "USER_LOGOUT": "User Logout",
  "EQUIPMENT_ADDED": "Added Equipment",
  "EQUIPMENT_EDITED": "Edited Equipment",
  "DOCUMENT_UPLOADED": "Uploaded Document",
  "REPORT_DOWNLOADED": "Downloaded Report",
  "CONFIGURATOR_OPENED": "Opened Configurator",
  "SUPPORT_REQUEST_SUBMITTED": "Submitted Support Request",
};

function KpiCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
}) {
  return (
    <div className="admin-glass admin-kpi">
      <div className="admin-kpi-label">
        <Icon size={13} style={{ color: "#E8692C", flexShrink: 0 }} />
        {label}
      </div>
      <div className="admin-kpi-value">{value}</div>
    </div>
  );
}

function formatAction(action: string) {
  return REQUIRED_ACTIONS[action as keyof typeof REQUIRED_ACTIONS] || 
    action
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
}

function metadataPreview(metadata: Record<string, unknown> | null) {
  const entries = Object.entries(metadata ?? {}).slice(0, 3);
  if (!entries.length) return "No details";
  return entries
    .map(([key, value]) => `${key}: ${formatValue(value)}`)
    .join(" | ");
}

function formatValue(value: unknown) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  const text = String(value);
  return text.length > 70 ? `${text.slice(0, 70)}...` : text;
}

function actorLabel(activity: AdminActivity) {
  if (!activity.actorId) return "System";
  if (activity.actorId === activity.userId) return "Self";
  return activity.actorName || activity.actorEmail || `User #${activity.actorId}`;
}

function fromForDays(days: string) {
  const duration = Number(days) * 24 * 60 * 60 * 1000;
  return new Date(Date.now() - duration).toISOString();
}

export default function AdminActivityPage() {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("all");
  const [days, setDays] = useState("30");
  const [customFromDate, setCustomFromDate] = useState("");
  const [customToDate, setCustomToDate] = useState("");
  const [page, setPage] = useState(1);

  const getFromDate = () => {
    if (days === "custom") {
      return customFromDate ? new Date(customFromDate).toISOString() : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }
    return fromForDays(days);
  };

  const { data: summary, isLoading: summaryLoading } = useQuery<AdminActivitySummary>({
    queryKey: ["admin", "activity-summary", days, customFromDate, customToDate],
    queryFn: () => {
      const daysNum = days === "custom" ? 30 : Number(days);
      return adminApi.activitySummary(daysNum) as Promise<AdminActivitySummary>;
    },
  });

  const {
    data,
    isLoading,
    isFetching,
    error,
  } = useQuery<PaginatedActivities>({
    queryKey: ["admin", "activity", search, action, days, customFromDate, customToDate, page],
    queryFn: () =>
      adminApi.listActivities({
        search,
        action: action !== "all" ? action : "all",
        from: getFromDate(),
        to: days === "custom" && customToDate ? new Date(customToDate).toISOString() : undefined,
        page,
        limit: 20,
      }) as Promise<PaginatedActivities>,
  });

  const activities = data?.activities ?? [];
  const errorMessage = error instanceof Error ? error.message : "Unable to load activity";

  return (
    <div>
      <div className="admin-page-header">
        <h2 className="admin-page-title">Activity Centre</h2>
        <p className="admin-page-sub">User actions, audit trail, and lead signals</p>
      </div>

      <div className="admin-kpi-grid" style={{ marginBottom: 24 }}>
        {summaryLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="admin-glass admin-kpi admin-skeleton" style={{ height: 100 }} />
          ))
        ) : (
          <>
            <KpiCard label="Total Events" value={summary?.totalActivities ?? 0} icon={Activity} />
            <KpiCard label="Active Users" value={summary?.uniqueUsers ?? 0} icon={UsersRound} />
            <KpiCard label="Logins" value={summary?.loginEvents ?? 0} icon={LogIn} />
            <KpiCard label="Equipment Changes" value={summary?.equipmentEvents ?? 0} icon={Truck} />
            <KpiCard label="Documents" value={summary?.documentEvents ?? 0} icon={Upload} />
          </>
        )}
      </div>

      <div className="admin-glass admin-toolbar" style={{ marginBottom: 16 }}>
        <div className="admin-toolbar-field" style={{ position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: "#64748b" }} />
          <input
            className="admin-input"
            style={{ paddingLeft: 36 }}
            placeholder="Search by action, user, or entity..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className="admin-input"
          style={{ width: 220 }}
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
        >
          {ACTION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <select
          className="admin-input"
          style={{ width: 150 }}
          value={days}
          onChange={(e) => {
            setDays(e.target.value);
            setPage(1);
          }}
        >
          {DAYS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        {days === "custom" && (
          <>
            <input
              type="date"
              className="admin-input"
              style={{ width: 140 }}
              value={customFromDate}
              onChange={(e) => {
                setCustomFromDate(e.target.value);
                setPage(1);
              }}
              placeholder="From date"
            />
            <input
              type="date"
              className="admin-input"
              style={{ width: 140 }}
              value={customToDate}
              onChange={(e) => {
                setCustomToDate(e.target.value);
                setPage(1);
              }}
              placeholder="To date"
            />
          </>
        )}
      </div>

      <div className="admin-glass admin-table-wrap">
        {isLoading ? (
          <div style={{ padding: 24 }}><div className="admin-skeleton" style={{ height: 280 }} /></div>
        ) : error ? (
          <div className="admin-empty">{errorMessage}</div>
        ) : activities.length === 0 ? (
          <div className="admin-empty">No activity found</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>User</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Actor</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((item) => (
                <tr key={item.id}>
                  <td style={{ minWidth: 150 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#6B7280", fontSize: 12 }}>
                      <Clock size={13} color="#9CA3AF" />
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td style={{ minWidth: 190 }}>
                    <div style={{ fontWeight: 700, color: "var(--a-t1)" }}>
                      {item.userName || item.userEmail || "Unknown user"}
                    </div>
                    {item.userEmail && (
                      <div style={{ color: "#9CA3AF", fontSize: 11, marginTop: 3 }}>{item.userEmail}</div>
                    )}
                  </td>
                  <td style={{ minWidth: 180 }}>
                    <div style={{ fontWeight: 700, color: "var(--a-t1)" }}>{formatAction(item.action)}</div>
                  </td>
                  <td style={{ minWidth: 150 }}>
                    <div style={{ fontWeight: 600 }}>{item.entityType || "System"}</div>
                    {item.entityId && (
                      <div style={{ color: "#9CA3AF", fontSize: 11, marginTop: 3 }}>#{item.entityId}</div>
                    )}
                  </td>
                  <td style={{ minWidth: 150, color: "#6B7280" }}>{actorLabel(item)}</td>
                  <td style={{ minWidth: 260, maxWidth: 380 }}>
                    <span style={{ display: "block", color: "#6B7280", fontSize: 12, lineHeight: 1.5, whiteSpace: "normal" }}>
                      {metadataPreview(item.metadata)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data && data.pagination.totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
          <button className="admin-btn admin-btn-ghost" disabled={page <= 1 || isFetching} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span style={{ padding: "8px 12px", color: "#6B7280", fontSize: 13 }}>Page {page} of {data.pagination.totalPages}</span>
          <button className="admin-btn admin-btn-ghost" disabled={page >= data.pagination.totalPages || isFetching} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginTop: 20 }}>
        <div className="admin-glass" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 13.5, fontWeight: 700, margin: "0 0 16px", color: "var(--a-t1)", display: "flex", alignItems: "center", gap: 8 }}>
            <Headphones size={15} color="#E8692C" /> Action Breakdown
          </h3>
          {(summary?.actionBreakdown ?? []).length === 0 ? (
            <div className="admin-empty">No action data</div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {summary?.actionBreakdown.map((item) => (
                <li key={item.action} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: "1px solid var(--a-b2)" }}>
                  <span style={{ color: "var(--a-t2)", fontSize: 13 }}>{formatAction(item.action)}</span>
                  <span className="admin-badge admin-badge-open">{item.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="admin-glass" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 13.5, fontWeight: 700, margin: "0 0 16px", color: "var(--a-t1)", display: "flex", alignItems: "center", gap: 8 }}>
            <FileDown size={15} color="#E8692C" /> Most Active Users
          </h3>
          {(summary?.topUsers ?? []).length === 0 ? (
            <div className="admin-empty">No user activity</div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {summary?.topUsers.map((user) => (
                <li key={user.userId} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: "1px solid var(--a-b2)" }}>
                  <span>
                    <span style={{ display: "block", fontWeight: 700, color: "var(--a-t1)", fontSize: 13 }}>{user.name}</span>
                    <span style={{ display: "block", color: "#9CA3AF", fontSize: 11, marginTop: 3 }}>{user.email}</span>
                  </span>
                  <span className="admin-badge admin-badge-active">{user.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
