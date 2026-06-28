"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import {
  Plus, Search, Pencil, Trash2, Eye, Archive, Copy, RotateCcw, Pin, 
  ChevronLeft, ChevronRight, X, TrendingUp, FileText, Eye as EyeIcon,
  CheckCircle2, AlertCircle, Zap,
} from "lucide-react";
import { toast } from "sonner";
import MarketingFormModal from "@/components/admin/marketing/MarketingFormModalSectioned";
import MarketingPreviewModal from "@/components/admin/marketing/MarketingPreviewModal";
import {
  getMarketing, getMarketingKpis, createMarketing, updateMarketing, deleteMarketing,
  archiveMarketing, restoreMarketing, duplicateMarketing, bulkMarketingAction,
  type MarketingItem, type MarketingFormData, type BulkMarketingAction,
} from "@/lib/api/marketing";
import { MARKETING, resolveAssetUrl } from "@/lib/constants";

const PAGE_SIZE = 10;

// KPI Card Component
function KPICard({ 
  icon: Icon, 
  label, 
  value, 
  subtitle, 
  trend,
  loading,
}: { 
  icon: React.ComponentType<{ size: number; color?: string }>;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  loading?: boolean;
}) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #ffffff 0%, #fff7f2 100%)",
      border: "1px solid rgba(232,105,44,0.16)",
      borderRadius: 16,
      padding: "16px 18px",
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      minHeight: 112,
      boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
    }}>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: "rgba(232,105,44,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={20} color="#E8692C" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
          {label}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}>
          {loading ? "—" : value}
        </div>
        {subtitle && (
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
            {subtitle}
          </div>
        )}
        {trend !== undefined && (
          <div style={{ fontSize: 11, color: trend >= 0 ? "#16a34a" : "#ef4444", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
            <TrendingUp size={12} />
            {trend >= 0 ? "+" : ""}{trend}%
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminMarketingPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"sortOrder" | "title" | "priority" | "createdAt">("sortOrder");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<MarketingItem | null>(null);
  const [previewItem, setPreviewItem] = useState<MarketingItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<MarketingItem | null>(null);
  const [confirmPublish, setConfirmPublish] = useState<MarketingFormData | null>(null);
  const [pendingSave, setPendingSave] = useState<{ data: MarketingFormData; isCreate: boolean; id?: number } | null>(null);

  // Main query
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "marketing", search, statusFilter, typeFilter, page, sortBy, sortDir],
    queryFn: () => getMarketing({
      search,
      status: statusFilter,
      type: typeFilter,
      includeArchived: statusFilter === "ARCHIVED" || statusFilter === "all",
      page,
      limit: PAGE_SIZE,
      sortBy,
      sortDir,
    }),
  });

  const { data: kpiData, isLoading: kpiLoading } = useQuery({
    queryKey: ["admin", "marketing", "kpis"],
    queryFn: getMarketingKpis,
  });

  const kpis = useMemo(() => ({
    total: kpiData?.totalNews ?? 0,
    published: kpiData?.published ?? 0,
    draft: kpiData?.drafts ?? 0,
    archived: kpiData?.archived ?? 0,
    pinned: kpiData?.pinned ?? 0,
    scheduled: kpiData?.scheduled ?? 0,
    expired: kpiData?.expired ?? 0,
    views: kpiData?.totalViews ?? 0,
    clicks: kpiData?.totalClicks ?? 0,
    ctr: `${(kpiData?.ctr ?? 0).toFixed(1)}%`,
  }), [kpiData]);

  const items = data?.marketing ?? [];
  const pagination = data?.pagination;
  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "marketing"] });

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === items.length) setSelected(new Set());
    else setSelected(new Set(items.map((i) => i.id)));
  };

  const handleBulk = async (action: BulkMarketingAction) => {
    if (!selected.size) return;
    try {
      const res = await bulkMarketingAction([...selected], action);
      toast.success(`${res.affected} item(s) updated`);
      setSelected(new Set());
      invalidate();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Bulk action failed");
    }
  };

  const saveMutation = useMutation({
    mutationFn: async ({ data, isCreate, id }: { data: MarketingFormData; isCreate: boolean; id?: number }) => {
      const payload = buildPayload(data);
      if (isCreate) return createMarketing(payload);
      return updateMarketing(id!, payload);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Saved successfully");
    },
    onError: (e: Error) => toast.error(e.message || "Failed to save"),
  });

  const buildPayload = (data: MarketingFormData) => ({
    type: data.type,
    title: data.title,
    subtitle: data.subtitle || undefined,
    body: data.body || undefined,
    richContent: data.richContent || undefined,
    imageUrl: data.imageUrl || undefined,
    thumbnailUrl: data.thumbnailUrl || undefined,
    ctaText: data.ctaText || undefined,
    ctaUrl: data.ctaUrl || undefined,
    status: data.status,
    isPinned: data.isPinned,
    priority: data.priority,
    tags: data.tags || undefined,
    startsAt: data.startsAt || undefined,
    endsAt: data.endsAt || undefined,
    isActive: data.status === "PUBLISHED",
  });

  const handleSave = async (data: MarketingFormData) => {
    if (data.status === "PUBLISHED" && !editItem) {
      setPendingSave({ data, isCreate: true });
      setConfirmPublish(data);
      return;
    }
    if (data.status === "PUBLISHED" && editItem) {
      setPendingSave({ data, isCreate: false, id: editItem.id });
      setConfirmPublish(data);
      return;
    }
    await saveMutation.mutateAsync({ data, isCreate: !editItem, id: editItem?.id });
    setShowCreate(false);
    setEditItem(null);
  };

  const confirmPublishSave = async () => {
    if (!pendingSave) return;
    await saveMutation.mutateAsync(pendingSave);
    setConfirmPublish(null);
    setPendingSave(null);
    setShowCreate(false);
    setEditItem(null);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteMarketing(confirmDelete.id);
      toast.success("Deleted successfully");
      setConfirmDelete(null);
      invalidate();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Modals */}
      {showCreate && (
        <MarketingFormModal
          title="Create News"
          onSave={handleSave}
          onClose={() => setShowCreate(false)}
        />
      )}
      {editItem && (
        <MarketingFormModal
          title="Edit News"
          initial={editItem}
          onSave={handleSave}
          onClose={() => setEditItem(null)}
        />
      )}
      {previewItem && (
        <MarketingPreviewModal
          item={previewItem}
          items={items}
          onClose={() => setPreviewItem(null)}
        />
      )}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Content"
          message={`Delete "${confirmDelete.title}"? This moves the item to archive.`}
          confirmLabel="Delete"
          confirmColor="#dc2626"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      {confirmPublish && (
        <ConfirmDialog
          title="Publish Content"
          message="Publish this announcement? It will appear on the user dashboard when active."
          confirmLabel="Publish"
          confirmColor="#16a34a"
          onConfirm={confirmPublishSave}
          onCancel={() => {
            setConfirmPublish(null);
            setPendingSave(null);
          }}
        />
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", background: "linear-gradient(135deg, #fffaf6 0%, #ffffff 100%)", border: "1px solid rgba(232,105,44,0.14)", borderRadius: 20, padding: "24px 24px", boxShadow: "0 18px 45px rgba(15,23,42,0.06)" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(232,105,44,0.10)", color: "#E8692C", borderRadius: 999, padding: "6px 10px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
            <FileText size={14} /> Marketing Center
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-0.02em", color: "#111827" }}>
            Marketing Center
          </h2>
          <p style={{ color: "#64748b", fontSize: 14, marginTop: 8, maxWidth: 620, lineHeight: 1.6 }}>
            Manage announcements, campaigns, dashboard banners, and user communications from a single premium workspace.
            {pagination && (
              <span style={{ marginLeft: 8, color: "#334155", fontWeight: 700 }}>
                · {pagination.total} total items
              </span>
            )}
          </p>
        </div>
        <button
          className="admin-btn admin-btn-primary"
          style={{ display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}
          onClick={() => setShowCreate(true)}
        >
          <Plus size={16} /> Create News
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        <KPICard icon={FileText} label="Total News" value={kpis.total} loading={kpiLoading || isLoading} subtitle="All active records" />
        <KPICard icon={CheckCircle2} label="Published" value={kpis.published} loading={kpiLoading || isLoading} subtitle="Live on dashboard" />
        <KPICard icon={AlertCircle} label="Drafts" value={kpis.draft} loading={kpiLoading || isLoading} subtitle="Not yet live" />
        <KPICard icon={Archive} label="Archived" value={kpis.archived} loading={kpiLoading || isLoading} subtitle="Hidden from view" />
        <KPICard icon={Pin} label="Pinned" value={kpis.pinned} loading={kpiLoading || isLoading} subtitle="Priority placements" />
        <KPICard icon={Zap} label="Scheduled" value={kpis.scheduled} loading={kpiLoading || isLoading} subtitle="Set to go live" />
        <KPICard icon={AlertCircle} label="Expired" value={kpis.expired} loading={kpiLoading || isLoading} subtitle="Past end date" />
        <KPICard icon={EyeIcon} label="Total Views" value={kpis.views} loading={kpiLoading || isLoading} subtitle="Engagement reach" />
        <KPICard icon={TrendingUp} label="Total Clicks" value={kpis.clicks} loading={kpiLoading || isLoading} subtitle="CTA interactions" />
        <KPICard icon={TrendingUp} label="CTR" value={kpis.ctr} loading={kpiLoading || isLoading} subtitle="Click-through rate" />
      </div>

      {/* Error State */}
      {error && (
        <div style={{
          padding: "12px 16px",
          borderRadius: 10,
          background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.3)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 14, color: "#ef4444" }}>
            Failed to load marketing content. Please try again.
          </span>
        </div>
      )}

      {/* Filters and Search */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ position: "relative", flex: "1 1 220px", minWidth: 220 }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#64748b",
                pointerEvents: "none",
              }}
            />
            <input
              className="admin-input"
              placeholder="Search title, subtitle, tags…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{ paddingLeft: 34 }}
            />
          </div>
          <button
            className="admin-btn admin-btn-ghost"
            onClick={() => setShowFilters((prev) => !prev)}
            style={{ whiteSpace: "nowrap" }}
          >
            {showFilters ? "Hide filters" : "Show filters"}
          </button>
        </div>
        {showFilters && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <select
              className="admin-input"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              style={{ minWidth: 140 }}
            >
              <option value="all">All Status</option>
              {MARKETING.STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              className="admin-input"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              style={{ minWidth: 160 }}
            >
              <option value="all">All Types</option>
              {MARKETING.TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <select
              className="admin-input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              style={{ minWidth: 140 }}
            >
              <option value="sortOrder">Order</option>
              <option value="title">Title</option>
              <option value="priority">Priority</option>
              <option value="createdAt">Created</option>
            </select>
            <select
              className="admin-input"
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as typeof sortDir)}
              style={{ minWidth: 120 }}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "12px 16px",
            borderRadius: 10,
            background: "rgba(232,105,44,0.08)",
            border: "1px solid rgba(232,105,44,0.2)",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 13, color: "#E8692C", fontWeight: 600 }}>
            {selected.size} selected
          </span>
          <ActionBtn
            icon={<EyeIcon size={13} />}
            label="Publish"
            onClick={() => handleBulk("PUBLISH")}
          />
          <ActionBtn
            icon={<Archive size={13} />}
            label="Unpublish"
            onClick={() => handleBulk("UNPUBLISH")}
          />
          <ActionBtn
            icon={<Archive size={13} />}
            label="Archive"
            onClick={() => handleBulk("ARCHIVE")}
          />
          <ActionBtn
            icon={<Trash2 size={13} />}
            label="Delete"
            onClick={() => handleBulk("DELETE")}
            danger
          />
          <div style={{ flex: 1 }} />
          <ActionBtn
            icon={<X size={13} />}
            label="Clear"
            onClick={() => setSelected(new Set())}
          />
        </div>
      )}

      {/* Table */}
      <div
        className="admin-glass admin-table-wrap"
        style={{ borderRadius: 12, overflow: "hidden" }}
      >
        {isLoading ? (
          <div style={{ padding: 32, textAlign: "center" }}>
            <div
              className="admin-skeleton"
              style={{ height: 40, marginBottom: 12 }}
            />
            <div
              className="admin-skeleton"
              style={{ height: 40, marginBottom: 12 }}
            />
            <div className="admin-skeleton" style={{ height: 40 }} />
          </div>
        ) : items.length === 0 ? (
          <div
            className="admin-empty"
            style={{
              padding: 48,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              justifyContent: "center",
              minHeight: 300,
            }}
          >
            <FileText size={40} color="#64748b" style={{ opacity: 0.3 }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#f1f5f9" }}>
                No marketing content found
              </div>
              <div style={{ fontSize: 14, color: "#94a3b8", marginTop: 4 }}>
                {search || statusFilter !== "all" || typeFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first announcement to get started"}
              </div>
            </div>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 36 }}>
                  <input
                    type="checkbox"
                    checked={selected.size === items.length && items.length > 0}
                    onChange={toggleAll}
                    aria-label="Select all"
                  />
                </th>
                <th>Content</th>
                <th style={{ width: 100 }}>Status</th>
                <th style={{ width: 80 }}>Priority</th>
                <th style={{ width: 100 }}>Created</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const cfg =
                  MARKETING.STATUS_CONFIG[item.status] ??
                  MARKETING.STATUS_CONFIG.DRAFT;
                const thumb = resolveAssetUrl(
                  item.thumbnailUrl || item.imageUrl
                );
                const createdDate = new Date(item.createdAt).toLocaleDateString(
                  "en-IN",
                  { day: "2-digit", month: "short" }
                );

                return (
                  <tr key={item.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        aria-label={`Select ${item.title}`}
                      />
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 52,
                            height: 36,
                            borderRadius: 8,
                            overflow: "hidden",
                            flexShrink: 0,
                            position: "relative",
                            background: "rgba(255,255,255,0.05)",
                          }}
                        >
                          {thumb && (
                            <Image
                              src={thumb}
                              alt={item.title}
                              fill
                              style={{ objectFit: "cover" }}
                            />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: 13,
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              marginBottom: 4,
                            }}
                          >
                            {item.title}
                            {item.isPinned && (
                              <Pin size={12} color="#E8692C" fill="#E8692C" />
                            )}
                          </div>
                          {item.subtitle && (
                            <div
                              style={{
                                fontSize: 11,
                                color: "#64748b",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item.subtitle}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "4px 10px",
                          borderRadius: 99,
                          background: cfg.bg,
                          color: cfg.color,
                          display: "inline-block",
                        }}
                      >
                        {cfg.label}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "#94a3b8", textAlign: "center" }}>
                      <Zap
                        size={12}
                        color={
                          item.priority > 50
                            ? "#fbbf24"
                            : item.priority > 0
                              ? "#60a5fa"
                              : "#64748b"
                        }
                        fill="currentColor"
                        style={{ marginRight: 4 }}
                      />
                      {item.priority}
                    </td>
                    <td style={{ fontSize: 12, color: "#64748b" }}>
                      {createdDate}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <IconBtn
                          icon={<Eye size={13} />}
                          title="Preview"
                          onClick={() => setPreviewItem(item)}
                        />
                        <IconBtn
                          icon={<Pencil size={13} />}
                          title="Edit"
                          onClick={() => setEditItem(item)}
                        />
                        <IconBtn
                          icon={<Copy size={13} />}
                          title="Duplicate"
                          onClick={async () => {
                            try {
                              await duplicateMarketing(item.id);
                              toast.success("Duplicated");
                              invalidate();
                            } catch {
                              toast.error("Duplicate failed");
                            }
                          }}
                        />
                        {item.status === "ARCHIVED" ? (
                          <IconBtn
                            icon={<RotateCcw size={13} />}
                            title="Restore"
                            onClick={async () => {
                              try {
                                await restoreMarketing(item.id);
                                toast.success("Restored");
                                invalidate();
                              } catch {
                                toast.error("Restore failed");
                              }
                            }}
                          />
                        ) : (
                          <IconBtn
                            icon={<Archive size={13} />}
                            title="Archive"
                            onClick={async () => {
                              try {
                                await archiveMarketing(item.id);
                                toast.success("Archived");
                                invalidate();
                              } catch {
                                toast.error("Archive failed");
                              }
                            }}
                          />
                        )}
                        <IconBtn
                          icon={<Trash2 size={13} />}
                          title="Delete"
                          danger
                          onClick={() => setConfirmDelete(item)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            marginTop: 16,
          }}
        >
          <button
            className="admin-btn admin-btn-ghost"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            style={{ padding: "8px 12px" }}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: 13, color: "#94a3b8", minWidth: 100, textAlign: "center" }}>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            className="admin-btn admin-btn-ghost"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            style={{ padding: "8px 12px" }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

function ActionBtn({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "7px 12px",
        borderRadius: 8,
        border: `1px solid ${danger ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.12)"}`,
        background: danger ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.04)",
        color: danger ? "#ef4444" : "#e2e8f0",
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: 5,
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = danger
          ? "rgba(239,68,68,0.12)"
          : "rgba(255,255,255,0.08)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = danger
          ? "rgba(239,68,68,0.06)"
          : "rgba(255,255,255,0.04)";
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function IconBtn({
  icon,
  title,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        padding: "6px 8px",
        borderRadius: 7,
        border: `1px solid ${danger ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.1)"}`,
        background: danger ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.04)",
        color: danger ? "#ef4444" : "#94a3b8",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = danger
          ? "rgba(239,68,68,0.12)"
          : "rgba(255,255,255,0.08)";
        el.style.color = danger ? "#ef4444" : "#e2e8f0";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = danger
          ? "rgba(239,68,68,0.06)"
          : "rgba(255,255,255,0.04)";
        el.style.color = danger ? "#ef4444" : "#94a3b8";
      }}
    >
      {icon}
    </button>
  );
}

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  confirmColor,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1001,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "var(--a-surface, #1E2433)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: 28,
          width: "100%",
          maxWidth: 420,
        }}
      >
        <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 10px" }}>
          {title}
        </h3>
        <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="admin-btn admin-btn-ghost" style={{ flex: 1 }} onClick={onCancel}>
            Cancel
          </button>
          <button
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 9,
              border: "none",
              background: confirmColor,
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "0.85";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "1";
            }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
