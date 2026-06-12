/**
 * FleetDetail — StratumIQ
 * Path: frontend/src/components/dashboard/fleet/FleetDetail.tsx
 *
 * Single asset detail page. Tabs: Overview | Operations | Maintenance | Parts | Analytics.
 * Matches PDF §5 — Asset Details Page layout.
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  Clock,
  Wrench,
  Package,
  BarChart3,
  Pencil,
  Trash2,
  Download,
  User,
  Banknote,
  Loader2,
} from "lucide-react";
import { DASH, BRAND } from "@/lib/constants";
import { safeFloat } from "@/lib/utils";
import PageShell from "../layout/PageShell";
import GlassCard from "../ui/GlassCard";
import Button from "../ui/Button";
import Tabs, { type TabItem } from "../ui/Tabs";
import Skeleton from "../ui/Skeleton";
import {
  useEquipmentDetail, useUpdateStatus, useUpdateHours,
  useDeleteEquipment, useServiceRecords, useOperations,
} from "./hooks/useFleet";
import {
  StatusBadge, CategoryBadge, ServiceTypeBadge,
  ServiceStatusBadge, ErrorBanner,
} from "./shared/FleetUI";
import { Icons } from "./shared/FleetIcons";
import ConfirmDeleteModal from "./modals/ConfirmDeleteModal";
import PartsTab from "./tabs/PartsTab";
import AnalyticsTab from "./tabs/AnalyticsTab";
import type { EquipmentStatus, ServiceRecord, OperationLog } from "@/types/fleet";

type Tab = "overview" | "operations" | "maintenance" | "parts" | "analytics";

const TABS: TabItem<Tab>[] = [
  { id: "overview", label: "Overview", icon: <Eye size={14} /> },
  { id: "operations", label: "Operations", icon: <Clock size={14} /> },
  { id: "maintenance", label: "Maintenance", icon: <Wrench size={14} /> },
  { id: "parts", label: "Parts", icon: <Package size={14} /> },
  { id: "analytics", label: "Analytics", icon: <BarChart3 size={14} /> },
];

export default function FleetDetail({ id }: { id: number }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { equipment, loading, error, refetch } = useEquipmentDetail(id);
  const { mutate: changeStatus } = useUpdateStatus();
  const { mutate: removeAsset, loading: deleting } = useDeleteEquipment();
  const { records: serviceRecords } = useServiceRecords(id);
  const { operations } = useOperations(id);

  // Load saved tab from localStorage
  useEffect(() => {
    const savedTab = localStorage.getItem(`fleet_tab_${id}`) as Tab;
    if (savedTab && TABS.some((t) => t.id === savedTab)) {
      setActiveTab(savedTab);
    }
  }, [id]);

  // Save tab to localStorage when changed
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    localStorage.setItem(`fleet_tab_${id}`, tab);
  };

  const handleDeleteClick = () => setShowDeleteModal(true);
  const handleDeleteConfirm = async () => {
    try {
      await removeAsset(id, () => router.push("/dashboard/fleet"));
    } catch {
      refetch();
      setShowDeleteModal(false);
    }
  };
  const handleDeleteCancel = () => setShowDeleteModal(false);

  const handleStatusChange = async (newStatus: EquipmentStatus) => {
    try {
      await changeStatus(id, { status: newStatus }, () => refetch());
    } catch { refetch(); }
  };

  if (loading) return <DetailSkeleton />;
  if (error) return <ErrorBanner message={error} />;
  if (!equipment) return null;

  const eq = equipment;
  const currentHours = safeFloat(eq.running_hours);

  return (
    <>
      <PageShell
        title={eq.name}
        description={[eq.brand, eq.model].filter(Boolean).join(" · ") || "Fleet asset"}
        breadcrumbs={[
          { label: "Fleet", href: "/dashboard/fleet" },
          { label: eq.name },
        ]}
        maxWidth={1000}
        actions={
          <div className="d-page-actions">
            <select
              className="d-select d-fleet-status-select"
              value={eq.status}
              onChange={(e) => handleStatusChange(e.target.value as EquipmentStatus)}
              aria-label="Asset status"
            >
              <option value="active">Active</option>
              <option value="idle">Idle</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              icon={<Pencil size={14} />}
              onClick={() => router.push(`/dashboard/fleet/${id}/edit`)}
            >
              Edit
            </Button>
            {eq.document_url && (
              <a href={eq.document_url} target="_blank" rel="noreferrer">
                <Button variant="ghost" size="sm" icon={<Download size={14} />}>
                  Export
                </Button>
              </a>
            )}
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 size={14} />}
              onClick={handleDeleteClick}
              loading={deleting}
            >
              Delete
            </Button>
          </div>
        }
        footer={
          <>
            <Button variant="outline" onClick={() => router.push("/dashboard/parts")}>
              Find Parts
            </Button>
            <Button variant="outline" onClick={() => router.push("/dashboard/maintenance")}>
              Find Service
            </Button>
          </>
        }
      >
        <GlassCard padding="none" className="d-fleet-detail-hero">
          {eq.image_url ? (
            <img src={eq.image_url} alt={eq.name} className="d-fleet-detail-hero-img" />
          ) : (
            <div className="d-fleet-detail-hero-placeholder">
              <Icons.Image size={64} />
            </div>
          )}
          <div className="d-fleet-detail-hero-overlay" />
          <div className="d-fleet-detail-hero-badge">
            <StatusBadge status={eq.status} />
          </div>
        </GlassCard>

        <Tabs tabs={TABS} value={activeTab} onChange={handleTabChange} variant="line" />

        <GlassCard padding="md" className="d-tab-panel">
          {activeTab === "overview" && <OverviewTab equipment={eq} />}
          {activeTab === "operations" && (
            <OperationsTab equipmentId={id} currentHours={currentHours} onHoursUpdated={refetch} />
          )}
          {activeTab === "maintenance" && <MaintenanceTab equipmentId={id} />}
          {activeTab === "parts" && <PartsTab equipment={eq} />}
          {activeTab === "analytics" && (
            <AnalyticsTab equipment={eq} serviceRecords={serviceRecords} operations={operations} />
          )}
        </GlassCard>
      </PageShell>

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemName={eq?.name}
        isDeleting={deleting}
      />
    </>
  );
}

// ── Overview Tab ──
function OverviewTab({ equipment: eq }: { equipment: ReturnType<typeof useEquipmentDetail>["equipment"] & object }) {
  if (!eq) return null;

  const runningHours = safeFloat(eq.running_hours);
  const overdueCount = parseInt(eq.overdue_count ?? "0");
  const serviceCount = parseInt(eq.service_count ?? "0");
  
  const healthScore = Math.min(100, Math.max(0, 100 - (overdueCount * 15)));
  const healthColor = healthScore >= 70 ? "#16A34A" : healthScore >= 40 ? "#D97706" : "#DC2626";
  const healthLabel = healthScore >= 70 ? "Optimal" : healthScore >= 40 ? "Attention" : "Critical";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
      
      {/* Equipment Details */}
      <div>
        <DetailSection title="Equipment Details" icon={<Icons.Equipment size={14} />}>
          <DetailRow label="Serial Number" value={eq.serial_number ?? "—"} icon={<Icons.Fleet size={12} />} />
          <DetailRow label="Make Year" value={eq.make_year ? String(eq.make_year) : "—"} icon={<Icons.Calendar size={12} />} />
          <DetailRow label="Category" value={<CategoryBadge category={eq.category} />} icon={<Icons.Filter size={12} />} />
          <DetailRow label="Running Hours" value={`${runningHours.toLocaleString()} hrs`} icon={<Icons.Clock size={12} />} />
          <DetailRow label="Location" value={eq.location ?? "—"} icon={<Icons.Location size={12} />} />
          <DetailRow label="Last Service" value={eq.last_service_date ? new Date(eq.last_service_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"} icon={<Icons.Calendar size={12} />} />
        </DetailSection>
      </div>

      {/* Product Specifications */}
      <div>
        <DetailSection title="Specifications" icon={<Icons.Settings size={14} />}>
          <DetailRow label="Engine" value={eq.engine_type ?? "—"} icon={<Icons.Maintenance size={12} />} />
          <DetailRow label="Power Output" value={eq.power_output ?? "—"} icon={<Icons.Analytics size={12} />} />
          <DetailRow label="Capacity" value={eq.capacity ?? "—"} icon={<Icons.Parts size={12} />} />
          <DetailRow label="Application" value={eq.application ?? "—"} icon={<Icons.Location size={12} />} />
          <DetailRow label="Attachments" value={eq.attachments ?? "—"} icon={<Icons.Parts size={12} />} />
          <DetailRow label="Documentation" value={eq.document_url ? <a href={eq.document_url} target="_blank" rel="noreferrer" style={{ color: BRAND.orange, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}><Icons.Download size={12} /> Manual</a> : "—"} icon={<Icons.Download size={12} />} />
        </DetailSection>
      </div>

      {/* Health & Service Stats */}
      <div>
        <DetailSection title="Health Status" icon={<Icons.Star size={14} />}>
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{ position: "relative", width: 100, margin: "0 auto 10px" }}>
              <svg viewBox="0 0 120 70" width="100" height="70">
                <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke={DASH.surface2} strokeWidth="10" strokeLinecap="round"/>
                <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke={healthColor} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(healthScore / 100) * 157} 157`} />
              </svg>
              <div style={{ position: "absolute", bottom: 0, width: "100%", textAlign: "center" }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: DASH.text }}>{healthScore}%</span>
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: healthColor }}>{healthLabel}</div>
            <div style={{ fontSize: 11.5, color: DASH.text3, marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <Icons.Alerts size={12} />
              {overdueCount > 0 ? `${overdueCount} overdue` : "All services on track"}
            </div>
          </div>
        </DetailSection>

        <DetailSection title="Service Records" icon={<Icons.Calendar size={14} />}>
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: DASH.text }}>{serviceCount}</div>
            <div style={{ fontSize: 12, color: DASH.text3 }}>Total service records</div>
          </div>
        </DetailSection>
      </div>
    </div>
  );
}

// ── Operations Tab ──
function OperationsTab({ equipmentId, currentHours, onHoursUpdated }: {
  equipmentId: number;
  currentHours: number;
  onHoursUpdated: () => void;
}) {
  const { operations, loading, error, log } = useOperations(equipmentId);
  const { mutate: updateHours } = useUpdateHours();

  const [showForm, setShowForm] = useState(false);
  const [eventType, setEventType] = useState<"hours_update" | "downtime" | "note">("hours_update");
  const [newHours, setNewHours] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [formErr, setFormErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr(null);
    setSubmitting(true);
    try {
      if (eventType === "hours_update") {
        const hrs = parseFloat(newHours);
        if (isNaN(hrs) || hrs < 0) { setFormErr("Enter a valid hours value"); setSubmitting(false); return; }
        if (hrs < currentHours) { setFormErr(`New hours (${hrs}) cannot be less than current (${currentHours})`); setSubmitting(false); return; }
        await updateHours(equipmentId, { running_hours: hrs, note: note || undefined }, onHoursUpdated);
      } else if (eventType === "downtime") {
        if (!reason.trim()) { setFormErr("Downtime reason is required"); setSubmitting(false); return; }
        await log({ event_type: "downtime", downtime_reason: reason, note: note || undefined }, () => {});
      } else {
        if (!note.trim()) { setFormErr("Note is required"); setSubmitting(false); return; }
        await log({ event_type: "note", note }, () => {});
      }
      setShowForm(false);
      setNewHours(""); setReason(""); setNote("");
    } catch (err) {
      setFormErr(err instanceof Error ? err.message : "Failed to log event");
    } finally {
      setSubmitting(false);
    }
  };

  const EVENT_ICONS: Record<string, { icon: React.ReactNode; label: string }> = {
    hours_update: { icon: <Icons.Clock size={14} />, label: "Hours Update" },
    downtime: { icon: <Icons.Alerts size={14} />, label: "Downtime" },
    note: { icon: <Icons.Edit size={14} />, label: "Note" },
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: DASH.text, display: "flex", alignItems: "center", gap: 8 }}>
          <Icons.Clock size={18} /> Operations Log
        </div>
        <button className="btn-primary" style={{ height: 36, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }} onClick={() => setShowForm(f => !f)}>
          {showForm ? <Icons.Close size={12} /> : <Icons.AddEquipment size={12} />}
          {showForm ? "Cancel" : "Log Event"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleLog} style={{ background: DASH.surface2, borderRadius: 12, padding: "20px", marginBottom: 24, border: `1px solid ${DASH.border}` }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            {(["hours_update", "downtime", "note"] as const).map(t => (
              <button key={t} type="button"
                onClick={() => setEventType(t)}
                style={{ flex: 1, minWidth: 100, height: 38, borderRadius: 8, border: `1.5px solid ${eventType === t ? BRAND.orange : DASH.border}`, background: eventType === t ? "rgba(232,105,44,0.08)" : DASH.surface, color: eventType === t ? BRAND.orange : DASH.text2, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                {EVENT_ICONS[t].icon} {EVENT_ICONS[t].label}
              </button>
            ))}
          </div>

          {eventType === "hours_update" && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: DASH.text3, fontWeight: 600, display: "block", marginBottom: 6 }}>New Total Running Hours</label>
              <input className="dash-input" type="number" min={currentHours} step="0.1" value={newHours} onChange={e => setNewHours(e.target.value)} placeholder={`Current: ${currentHours.toLocaleString()} hrs`} required style={{ height: 42, fontSize: 13 }} />
              <div style={{ fontSize: 11, color: DASH.text3, marginTop: 4 }}>Current: {currentHours.toLocaleString()} hrs</div>
            </div>
          )}

          {eventType === "downtime" && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: DASH.text3, fontWeight: 600, display: "block", marginBottom: 6 }}>Downtime Reason *</label>
              <input className="dash-input" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Hydraulic failure, electrical issue, maintenance" required style={{ height: 42, fontSize: 13 }} />
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: DASH.text3, fontWeight: 600, display: "block", marginBottom: 6 }}>Note {eventType === "note" ? "*" : "(optional)"}</label>
            <textarea className="dash-input" value={note} onChange={e => setNote(e.target.value)} placeholder="Additional context…" required={eventType === "note"} style={{ height: 80, fontSize: 13, resize: "vertical", paddingTop: 10 }} />
          </div>

          {formErr && <div style={{ padding: "10px 14px", background: "rgba(220,38,38,0.08)", borderRadius: 8, fontSize: 12.5, color: "#DC2626", marginBottom: 16 }}>{formErr}</div>}
          
          <button type="submit" className="btn-primary" style={{ height: 40, fontSize: 13, display: "flex", alignItems: "center", gap: 6, width: "100%", justifyContent: "center" }} disabled={submitting}>
            {submitting ? <Loader2 size={14} className="d-spin" /> : <Icons.Check size={14} />}
            {submitting ? "Saving..." : "Save Event"}
          </button>
        </form>
      )}

      {error && <ErrorBanner message={error} />}
      
      {loading && <div className="skeleton" style={{ height: 200, borderRadius: 10 }} />}
      
      {!loading && operations.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: DASH.text3 }}>
          <span style={{ marginBottom: 16, opacity: 0.4, display: "block" }}><Icons.Clock size={40} /></span>
          <div style={{ fontSize: 14, marginBottom: 4 }}>No operations logged</div>
          <div style={{ fontSize: 12 }}>Click "Log Event" to record hours, downtime, or notes</div>
        </div>
      )}
      
      {!loading && operations.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {operations.map((op, i) => (
            <OperationRow key={op.id} op={op} isLast={i === operations.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function OperationRow({ op, isLast }: { op: OperationLog; isLast: boolean }) {
  const icons: Record<string, React.ReactNode> = {
    hours_update: <Icons.Clock size={14} />,
    downtime: <Icons.Alerts size={14} />,
    note: <Icons.Edit size={14} />,
  };
  
  let label = "";
  if (op.event_type === "hours_update") {
    const hoursLogged = safeFloat(op.hours_logged);
    const totalHours = safeFloat(op.total_hours_snapshot);
    label = `Hours update: +${hoursLogged.toLocaleString()} hrs (total: ${totalHours.toLocaleString()} hrs)`;
  } else if (op.event_type === "downtime") {
    label = `Downtime: ${op.downtime_reason}`;
  } else {
    label = "Note added";
  }

  return (
    <div style={{ 
      display: "flex", 
      gap: 14, 
      padding: "16px 0", 
      borderBottom: isLast ? "none" : `1px solid ${DASH.border2}`,
      alignItems: "flex-start",
    }}>
      <div style={{ 
        width: 36, 
        height: 36, 
        borderRadius: 10, 
        background: DASH.surface2, 
        border: `1px solid ${DASH.border}`, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        flexShrink: 0, 
        color: BRAND.orange,
      }}>
        {icons[op.event_type]}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: DASH.text, marginBottom: 4 }}>{label}</div>
        {op.note && <div style={{ fontSize: 12.5, color: DASH.text3, marginBottom: 6 }}>{op.note}</div>}
        <div style={{ fontSize: 11, color: DASH.text3, display: "flex", alignItems: "center", gap: 6 }}>
          <Icons.Calendar size={10} />
          {new Date(op.logged_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

// ── Maintenance Tab ──
function MaintenanceTab({ equipmentId }: { equipmentId: number }) {
  const { records, loading, error, saving, create, remove } = useServiceRecords(equipmentId);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", service_type: "preventive", status: "scheduled", description: "", technician_name: "", service_date: "", cost: "" });
  const [formErr, setFormErr] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setFormErr("Title is required");
      return;
    }
    setFormErr(null);
    try {
      await create({
        title: form.title.trim(),
        service_type: form.service_type as "preventive" | "corrective" | "inspection",
        status: form.status as "scheduled" | "in_progress" | "completed" | "overdue",
        description: form.description || undefined,
        technician_name: form.technician_name || undefined,
        service_date: form.service_date || undefined,
        cost: form.cost ? parseFloat(form.cost) : undefined,
      }, () => {
        setShowForm(false);
        setForm({ title: "", service_type: "preventive", status: "scheduled", description: "", technician_name: "", service_date: "", cost: "" });
      });
    } catch (err) {
      setFormErr(err instanceof Error ? err.message : "Failed to add record");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: DASH.text, display: "flex", alignItems: "center", gap: 8 }}>
          <Icons.Maintenance size={18} /> Service History
        </div>
        <button className="btn-primary" style={{ height: 36, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }} onClick={() => setShowForm(f => !f)}>
          {showForm ? <Icons.Close size={12} /> : <Icons.AddEquipment size={12} />}
          {showForm ? "Cancel" : "Add Service Record"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={{ background: DASH.surface2, borderRadius: 12, padding: "20px", marginBottom: 24, border: `1px solid ${DASH.border}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: DASH.text3, fontWeight: 600, display: "block", marginBottom: 4 }}>Title *</label>
              <input className="dash-input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. 500-hr service" required style={{ height: 40, fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: DASH.text3, fontWeight: 600, display: "block", marginBottom: 4 }}>Type *</label>
              <select className="dash-input" value={form.service_type} onChange={e => setForm(f => ({ ...f, service_type: e.target.value }))} style={{ height: 40, fontSize: 13 }}>
                <option value="preventive">Preventive</option>
                <option value="corrective">Corrective</option>
                <option value="inspection">Inspection</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: DASH.text3, fontWeight: 600, display: "block", marginBottom: 4 }}>Status</label>
              <select className="dash-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={{ height: 40, fontSize: 13 }}>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: DASH.text3, fontWeight: 600, display: "block", marginBottom: 4 }}>Service Date</label>
              <input className="dash-input" type="date" value={form.service_date} onChange={e => setForm(f => ({ ...f, service_date: e.target.value }))} style={{ height: 40, fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: DASH.text3, fontWeight: 600, display: "block", marginBottom: 4 }}>Technician</label>
              <input className="dash-input" value={form.technician_name} onChange={e => setForm(f => ({ ...f, technician_name: e.target.value }))} placeholder="Name" style={{ height: 40, fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: DASH.text3, fontWeight: 600, display: "block", marginBottom: 4 }}>Cost (₹)</label>
              <input className="dash-input" type="number" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} placeholder="0" style={{ height: 40, fontSize: 13 }} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: DASH.text3, fontWeight: 600, display: "block", marginBottom: 4 }}>Description</label>
            <textarea className="dash-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional notes" style={{ height: 80, fontSize: 13, resize: "vertical", paddingTop: 10 }} />
          </div>
          {formErr && <div style={{ padding: "10px 14px", background: "rgba(220,38,38,0.08)", borderRadius: 8, fontSize: 12.5, color: "#DC2626", marginBottom: 16 }}>{formErr}</div>}
          <button type="submit" className="btn-primary" style={{ height: 40, fontSize: 13, display: "flex", alignItems: "center", gap: 6, width: "100%", justifyContent: "center" }} disabled={saving}>
            {saving ? <Loader2 size={14} className="d-spin" /> : <Icons.Check size={14} />}
            {saving ? "Saving..." : "Add Record"}
          </button>
        </form>
      )}

      {error && <ErrorBanner message={error} />}
      
      {loading && <div className="skeleton" style={{ height: 200, borderRadius: 10 }} />}
      
      {!loading && records.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: DASH.text3 }}>
          <span style={{ marginBottom: 16, opacity: 0.4, display: "block" }}><Icons.Maintenance size={40} /></span>
          <div style={{ fontSize: 14, marginBottom: 4 }}>No service records</div>
          <div style={{ fontSize: 12 }}>Click "Add Service Record" to log maintenance history</div>
        </div>
      )}
      
      {!loading && records.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {records.map(record => (
            <ServiceRecordRow key={record.id} record={record} onDelete={() => remove(record.id, () => {})} />
          ))}
        </div>
      )}
    </div>
  );
}

function ServiceRecordRow({ record, onDelete }: { record: ServiceRecord; onDelete: () => void }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm("Remove this service record? This cannot be undone.")) {
      setIsDeleting(true);
      await onDelete();
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ padding: "16px", background: DASH.surface2, borderRadius: 12, border: `1px solid ${DASH.border}`, display: "flex", gap: 14, alignItems: "flex-start" }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(232,105,44,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: BRAND.orange, flexShrink: 0 }}>
        <Icons.Maintenance size={20} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: DASH.text }}>{record.title}</span>
          <ServiceTypeBadge type={record.service_type} />
          <ServiceStatusBadge status={record.status} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, rowGap: 8, marginBottom: 8 }}>
          {record.service_date && (
            <span style={{ fontSize: 12, color: DASH.text3, display: "flex", alignItems: "center", gap: 4 }}>
              <Icons.Calendar size={10} /> {new Date(record.service_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          )}
          {record.technician_name && (
            <span style={{ fontSize: 12, color: DASH.text3, display: "flex", alignItems: "center", gap: 4 }}>
              <User size={10} /> {record.technician_name}
            </span>
          )}
          {record.cost && (
            <span style={{ fontSize: 12, color: DASH.text3, display: "flex", alignItems: "center", gap: 4 }}>
              <Banknote size={10} /> ₹{parseFloat(record.cost).toLocaleString()}
            </span>
          )}
          {record.hours_at_service && (
            <span style={{ fontSize: 12, color: DASH.text3, display: "flex", alignItems: "center", gap: 4 }}>
              <Icons.Clock size={10} /> {parseFloat(record.hours_at_service).toLocaleString()} hrs
            </span>
          )}
        </div>
        {record.description && <div style={{ fontSize: 12.5, color: DASH.text3, marginTop: 4 }}>{record.description}</div>}
      </div>
      <button onClick={handleDelete} disabled={isDeleting} style={{ background: "none", border: "none", cursor: "pointer", color: DASH.text3, padding: 4, flexShrink: 0, opacity: isDeleting ? 0.5 : 1 }} title="Remove">
        <Icons.Delete size={16} />
      </button>
    </div>
  );
}

// ── Helper Components ──
function DetailSection({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: DASH.text, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${DASH.border}`, display: "flex", alignItems: "center", gap: 8 }}>
        {icon} {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{children}</div>
    </div>
  );
}

function DetailRow({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 12.5, color: DASH.text3, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
        {icon} {label}:
      </span>
      <span style={{ fontSize: 12.5, color: DASH.text, fontWeight: 600, textAlign: "right", wordBreak: "break-word" }}>{value}</span>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <PageShell breadcrumbs={[{ label: "Fleet", href: "/dashboard/fleet" }]} maxWidth={1000}>
      <Skeleton height={220} className="d-skeleton-block" />
      <Skeleton height={48} className="d-skeleton-block d-mt-sm" />
      <Skeleton height={300} className="d-skeleton-block d-mt-sm" />
    </PageShell>
  );
}