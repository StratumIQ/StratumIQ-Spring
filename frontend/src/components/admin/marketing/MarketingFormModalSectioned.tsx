"use client";

import { useState } from "react";
import { X, AlertCircle, Settings, Images, Clock, Search, Eye as EyeIcon } from "lucide-react";
import MarketingImageField from "./MarketingImageField";
import { MARKETING } from "@/lib/constants";
import type { MarketingFormData, MarketingItem, MarketingStatus } from "@/lib/api/marketing";

type Props = {
  title:    string;
  initial?: MarketingItem;
  onSave:   (data: MarketingFormData) => Promise<void>;
  onClose:  () => void;
};

const EMPTY: MarketingFormData = {
  type: "NEWS", title: "", subtitle: "", body: "", richContent: "",
  imageUrl: "", thumbnailUrl: "", ctaText: "", ctaUrl: "",
  status: "DRAFT", isPinned: false, priority: 0, tags: "",
  startsAt: "", endsAt: "",
};

function toForm(item?: MarketingItem): MarketingFormData {
  if (!item) return { ...EMPTY };
  return {
    type:         item.type,
    title:        item.title,
    subtitle:     item.subtitle ?? "",
    body:         item.body ?? "",
    richContent:  item.richContent ?? "",
    imageUrl:     item.imageUrl ?? "",
    thumbnailUrl: item.thumbnailUrl ?? "",
    ctaText:      item.ctaText ?? "",
    ctaUrl:       item.ctaUrl ?? "",
    status:       item.status ?? "DRAFT",
    isPinned:     item.isPinned ?? false,
    priority:     item.priority ?? 0,
    tags:         item.tags ?? "",
    startsAt:     item.startsAt ? item.startsAt.slice(0, 16) : "",
    endsAt:       item.endsAt ? item.endsAt.slice(0, 16) : "",
  };
}

type Tab = "general" | "images" | "publishing" | "seo" | "preview";

export default function MarketingFormModal({ title, initial, onSave, onClose }: Props) {
  const [form, setForm] = useState<MarketingFormData>(() => toForm(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<Tab>("general");

  const set = <K extends keyof MarketingFormData>(key: K, val: MarketingFormData[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.title.trim()) {
      errors.title = "Title is required.";
    } else if (form.title.trim().length < 3) {
      errors.title = "Title must be at least 3 characters.";
    } else if (form.title.trim().length > 200) {
      errors.title = "Title must be less than 200 characters.";
    }

    if (!form.body.trim()) {
      errors.body = "Description is required.";
    } else if (form.body.trim().length > 5000) {
      errors.body = "Description must not exceed 5000 characters.";
    }

    if (!form.imageUrl.trim()) {
      errors.imageUrl = "Please upload a banner image.";
    }

    if (!form.thumbnailUrl.trim()) {
      errors.thumbnailUrl = "Please upload a thumbnail image.";
    }

    if (!Number.isFinite(form.priority) || form.priority <= 0) {
      errors.priority = "Priority must be greater than zero.";
    }

    if (form.subtitle && form.subtitle.length > 300) {
      errors.subtitle = "Subtitle must be less than 300 characters.";
    }

    if (form.ctaUrl && !/^https?:\/\/.+/.test(form.ctaUrl)) {
      errors.ctaUrl = "CTA URL must be a valid URL (http:// or https://).";
    }

    if (form.startsAt && form.endsAt) {
      const start = new Date(form.startsAt).getTime();
      const end = new Date(form.endsAt).getTime();
      if (start >= end) {
        errors.endsAt = "End date must be after start date.";
      }
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      const firstKey = Object.keys(errors)[0] as keyof typeof errors;
      const firstField = document.querySelector<HTMLElement>(`[data-field="${firstKey}"]`);
      firstField?.focus();
      firstField?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    setError(null);

    if (!validateForm()) {
      setActiveTab("general");
      setError("Please complete the highlighted fields before saving.");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        ...form,
        title:    form.title.trim(),
        subtitle: form.subtitle.trim(),
        body:     form.body.trim(),
        richContent: form.richContent.trim(),
        ctaText:  form.ctaText.trim(),
        ctaUrl:   form.ctaUrl.trim(),
        tags:     form.tags.trim(),
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : "",
        endsAt:   form.endsAt ? new Date(form.endsAt).toISOString() : "",
      });
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred while saving";
      const details = err instanceof Error && "details" in err ? (err as Error & { details?: Record<string, string> }).details : undefined;
      const mapped = details && Object.keys(details).length ? details : undefined;
      setFieldErrors((prev) => ({ ...prev, ...(mapped ?? {}) }));
      setError(mapped ? "Please fix the highlighted fields before saving." : message);
      setSaving(false);
    }
  };

  const tabs: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
    { id: "general", label: "General", icon: <Settings size={16} /> },
    { id: "images", label: "Images", icon: <Images size={16} /> },
    { id: "publishing", label: "Publishing", icon: <Clock size={16} /> },
    { id: "seo", label: "SEO", icon: <Search size={16} /> },
    { id: "preview", label: "Preview", icon: <EyeIcon size={16} /> },
  ];

  return (
    <div style={overlayStyle}>
      <div style={panelStyle}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(15, 23, 42, 0.08)" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: "#0f172a" }}>{title}</h3>
          <button 
            onClick={onClose} 
            disabled={saving}
            style={iconBtnStyle} 
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{
            padding: "12px 14px",
            borderRadius: 8,
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            marginBottom: 16,
          }}>
            <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: 13, color: "#ef4444" }}>{error}</div>
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, borderBottom: "1px solid rgba(15, 23, 42, 0.08)", overflowX: "auto", paddingBottom: 0 }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={saving}
              style={{
                padding: "12px 16px",
                borderBottom: activeTab === tab.id ? "2px solid #E8692C" : "2px solid transparent",
                background: "transparent",
                color: activeTab === tab.id ? "#E8692C" : "#64748b",
                cursor: saving ? "not-allowed" : "pointer",
                fontSize: 13,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 6,
                whiteSpace: "nowrap",
                transition: "all 0.2s",
                opacity: saving ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id && !saving) {
                  (e.currentTarget as HTMLElement).style.color = "#0f172a";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id && !saving) {
                  (e.currentTarget as HTMLElement).style.color = "#64748b";
                }
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: "calc(90vh - 280px)", overflowY: "auto", paddingRight: 8 }}>
          {/* GENERAL TAB */}
          {activeTab === "general" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Content Type" error={fieldErrors.type} required dataField="type">
                  <select 
                    className="admin-input" 
                    value={form.type} 
                    onChange={(e) => set("type", e.target.value)}
                    disabled={saving}
                  >
                    {MARKETING.TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                  </select>
                </Field>
                <Field label="Status" error={fieldErrors.status} required dataField="status">
                  <select 
                    className="admin-input" 
                    value={form.status}
                    onChange={(e) => set("status", e.target.value as MarketingStatus)}
                    disabled={saving}
                  >
                    {MARKETING.STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Title" error={fieldErrors.title} required dataField="title">
                <input 
                  className="admin-input" 
                  value={form.title} 
                  maxLength={200}
                  onChange={(e) => set("title", e.target.value)} 
                  placeholder="Announcement title"
                  disabled={saving}
                  autoFocus
                />
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                  {form.title.length}/200 characters
                </div>
              </Field>

              <Field label="Subtitle" error={fieldErrors.subtitle} dataField="subtitle">
                <input 
                  className="admin-input" 
                  value={form.subtitle} 
                  maxLength={300}
                  onChange={(e) => set("subtitle", e.target.value)} 
                  placeholder="Short subtitle for cards"
                  disabled={saving}
                />
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                  {form.subtitle.length}/300 characters
                </div>
              </Field>

              <Field label="Description" error={fieldErrors.body} required dataField="body">
                <textarea 
                  className="admin-input" 
                  value={form.body} 
                  onChange={(e) => set("body", e.target.value)}
                  style={{ minHeight: 80, resize: "vertical", padding: 10, lineHeight: 1.6 }}
                  placeholder="Brief description shown in cards and slider"
                  disabled={saving}
                />
              </Field>

              <Field label="Full Content" dataField="richContent">
                <textarea 
                  className="admin-input" 
                  value={form.richContent}
                  onChange={(e) => set("richContent", e.target.value)}
                  style={{ minHeight: 100, resize: "vertical", padding: 10, lineHeight: 1.6 }}
                  placeholder="Complete announcement content (supports HTML)"
                  disabled={saving}
                />
              </Field>

              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.5 : 1 }}>
                <input 
                  type="checkbox" 
                  checked={form.isPinned} 
                  onChange={(e) => set("isPinned", e.target.checked)}
                  disabled={saving}
                />
                <span>Pin to top of user dashboard</span>
              </label>
            </>
          )}

          {/* IMAGES TAB */}
          {activeTab === "images" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div data-field="imageUrl">
                  <MarketingImageField 
                    label="Banner Image" 
                    value={form.imageUrl}
                    onChange={(url) => set("imageUrl", url)} 
                    aspectRatio={MARKETING.BANNER_ASPECT}
                    hint="16:9 · auto-cropped & compressed"
                    disabled={saving}
                  />
                  {fieldErrors.imageUrl && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{fieldErrors.imageUrl}</div>}
                </div>
                <div data-field="thumbnailUrl">
                  <MarketingImageField 
                    label="Thumbnail" 
                    value={form.thumbnailUrl}
                    onChange={(url) => set("thumbnailUrl", url)} 
                    aspectRatio={MARKETING.THUMB_ASPECT}
                    hint="4:3 · auto-cropped & compressed"
                    disabled={saving}
                  />
                  {fieldErrors.thumbnailUrl && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{fieldErrors.thumbnailUrl}</div>}
                </div>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.3)", fontSize: 12, color: "#93c5fd" }}>
                💡 Images are automatically compressed and optimized. Maximum size: 5 MB per image.
              </div>
            </>
          )}

          {/* PUBLISHING TAB */}
          {activeTab === "publishing" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <Field label="Priority" error={fieldErrors.priority} required dataField="priority">
                  <input 
                    className="admin-input" 
                    type="number" 
                    min={0} 
                    max={100} 
                    value={form.priority}
                    onChange={(e) => set("priority", Number(e.target.value || 0))}
                    disabled={saving}
                  />
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>0-100 (higher = more visibility)</div>
                </Field>
                <Field label="Publish Date" error={fieldErrors.startsAt} dataField="startsAt">
                  <input 
                    className="admin-input" 
                    type="datetime-local" 
                    value={form.startsAt}
                    onChange={(e) => set("startsAt", e.target.value)}
                    disabled={saving}
                  />
                </Field>
                <Field label="Expiry Date" error={fieldErrors.endsAt} dataField="endsAt">
                  <input 
                    className="admin-input" 
                    type="datetime-local" 
                    value={form.endsAt}
                    onChange={(e) => set("endsAt", e.target.value)}
                    disabled={saving}
                  />
                </Field>
              </div>
              <div style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.3)", fontSize: 12, color: "#93c5fd" }}>
                ⏰ Leave publish date empty to appear immediately. Items expire on the end date (optional).
              </div>
            </>
          )}

          {/* SEO TAB */}
          {activeTab === "seo" && (
            <>
              <Field label="CTA Button Text" dataField="ctaText">
                <input 
                  className="admin-input" 
                  value={form.ctaText}
                  onChange={(e) => set("ctaText", e.target.value)} 
                  placeholder="Learn More"
                  disabled={saving}
                />
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Call-to-action button text</div>
              </Field>

              <Field label="CTA URL" error={fieldErrors.ctaUrl} dataField="ctaUrl">
                <input 
                  className="admin-input" 
                  value={form.ctaUrl} 
                  type="url"
                  onChange={(e) => set("ctaUrl", e.target.value)} 
                  placeholder="https://example.com/page"
                  disabled={saving}
                />
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Full URL with http:// or https://</div>
              </Field>

              <Field label="Tags" dataField="tags">
                <input 
                  className="admin-input" 
                  value={form.tags}
                  onChange={(e) => set("tags", e.target.value)} 
                  placeholder="fleet, maintenance, product, announcement"
                  disabled={saving}
                />
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Comma-separated tags for organization</div>
              </Field>

              <div style={{ padding: "12px 14px", borderRadius: 8, background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.3)", fontSize: 12, color: "#93c5fd" }}>
                🔍 Tags help users discover related content and improve searchability.
              </div>
            </>
          )}

          {/* PREVIEW TAB */}
          {activeTab === "preview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ padding: "16px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginBottom: 12, textTransform: "uppercase" }}>Card Preview</div>
                <div style={{ background: "#1a1f2e", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ width: "100%", height: 180, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                    {form.imageUrl ? "Banner Preview" : "No Banner"}
                  </div>
                  <div style={{ padding: "16px" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{form.title || "Title"}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12, lineHeight: 1.5 }}>
                      {form.subtitle || "Subtitle preview"}
                    </div>
                    {form.ctaUrl && (
                      <div style={{ fontSize: 12, color: "#E8692C", fontWeight: 600 }}>
                        {form.ctaText || "Learn More"} →
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ padding: "16px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginBottom: 12, textTransform: "uppercase" }}>Content Preview</div>
                <div style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {form.body || form.richContent || "No content yet"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", gap: 10, marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(15, 23, 42, 0.08)", position: "sticky", bottom: 0, background: "#fff" }}>
          <button 
            className="admin-btn admin-btn-ghost" 
            style={{ flex: 1 }} 
            onClick={onClose} 
            disabled={saving}
          >
            Cancel
          </button>
          <button 
            className="admin-btn admin-btn-primary" 
            style={{ flex: 2 }}
            onClick={handleSave} 
            disabled={saving}
          >
            {saving ? "Saving…" : "Save News"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, error, required, dataField }: { label: string; children: React.ReactNode; error?: string; required?: boolean; dataField?: string }) {
  return (
    <div data-field={dataField}>
      <label style={{
        fontSize: 11, fontWeight: 700, color: error ? "#ef4444" : "#64748b",
        textTransform: "uppercase", letterSpacing: "0.06em",
        display: "block", marginBottom: 6,
      }}>{label}{required ? <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span> : null}</label>
      {children}
      {error && (
        <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>
          {error}
        </div>
      )}
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed", inset: 0, zIndex: 1000,
  background: "rgba(15, 23, 42, 0.68)", backdropFilter: "blur(4px)",
  display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
};

const panelStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid rgba(15, 23, 42, 0.08)",
  borderRadius: 16,
  width: "100%",
  maxWidth: 700,
  maxHeight: "90vh",
  display: "flex",
  flexDirection: "column",
  padding: 28,
  color: "#0f172a",
  boxShadow: "0 24px 64px rgba(15, 23, 42, 0.16)",
};

const iconBtnStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#94a3b8",
  cursor: "pointer",
  padding: 4,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
