"use client";

import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
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

export default function MarketingFormModal({ title, initial, onSave, onClose }: Props) {
  const [form, setForm]   = useState<MarketingFormData>(() => toForm(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof MarketingFormData>(key: K, val: MarketingFormData[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
    // Clear field error when user starts typing
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
      errors.title = "Title is required";
    } else if (form.title.trim().length < 3) {
      errors.title = "Title must be at least 3 characters";
    } else if (form.title.trim().length > 200) {
      errors.title = "Title must be less than 200 characters";
    }

    if (form.subtitle && form.subtitle.length > 300) {
      errors.subtitle = "Subtitle must be less than 300 characters";
    }

    if (form.ctaUrl && !/^https?:\/\/.+/.test(form.ctaUrl)) {
      errors.ctaUrl = "CTA URL must be a valid URL (http:// or https://)";
    }

    if (form.startsAt && form.endsAt) {
      const start = new Date(form.startsAt).getTime();
      const end = new Date(form.endsAt).getTime();
      if (start >= end) {
        errors.endsAt = "End date must be after start date";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    setError(null);

    if (!validateForm()) {
      setError("Please fix the errors below");
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
      setError(message);
      setSaving(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={panelStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 22 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>{title}</h3>
          <button 
            onClick={onClose} 
            disabled={saving}
            style={iconBtnStyle} 
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

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

        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: "calc(90vh - 140px)", overflowY: "auto", paddingRight: 8 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Type" error={fieldErrors.type}>
              <select 
                className="admin-input" 
                value={form.type} 
                onChange={(e) => set("type", e.target.value)}
                disabled={saving}
              >
                {MARKETING.TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
              </select>
            </Field>
            <Field label="Status" error={fieldErrors.status}>
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

          <Field label="Title" error={fieldErrors.title}>
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
              {form.title.length}/200
            </div>
          </Field>

          <Field label="Subtitle" error={fieldErrors.subtitle}>
            <input 
              className="admin-input" 
              value={form.subtitle} 
              maxLength={300}
              onChange={(e) => set("subtitle", e.target.value)} 
              placeholder="Short subtitle"
              disabled={saving}
            />
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
              {form.subtitle.length}/300
            </div>
          </Field>

          <Field label="Description">
            <textarea 
              className="admin-input" 
              value={form.body} 
              onChange={(e) => set("body", e.target.value)}
              style={{ minHeight: 72, resize: "vertical", padding: 10, lineHeight: 1.6 }}
              placeholder="Brief description for cards and slider"
              disabled={saving}
            />
          </Field>

          <Field label="Rich Content">
            <textarea 
              className="admin-input" 
              value={form.richContent}
              onChange={(e) => set("richContent", e.target.value)}
              style={{ minHeight: 100, resize: "vertical", padding: 10, lineHeight: 1.6 }}
              placeholder="Full announcement content (HTML supported)"
              disabled={saving}
            />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <MarketingImageField 
              label="Banner Image" 
              value={form.imageUrl}
              onChange={(url) => set("imageUrl", url)} 
              aspectRatio={MARKETING.BANNER_ASPECT}
              hint="16:9 · auto-cropped & compressed"
              disabled={saving}
            />
            <MarketingImageField 
              label="Thumbnail" 
              value={form.thumbnailUrl}
              onChange={(url) => set("thumbnailUrl", url)} 
              aspectRatio={MARKETING.THUMB_ASPECT}
              hint="4:3 · auto-cropped & compressed"
              disabled={saving}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="CTA Button Text" error={fieldErrors.ctaText}>
              <input 
                className="admin-input" 
                value={form.ctaText}
                onChange={(e) => set("ctaText", e.target.value)} 
                placeholder="Learn More"
                disabled={saving}
              />
            </Field>
            <Field label="CTA URL" error={fieldErrors.ctaUrl}>
              <input 
                className="admin-input" 
                value={form.ctaUrl} 
                type="url"
                onChange={(e) => set("ctaUrl", e.target.value)} 
                placeholder="https://..."
                disabled={saving}
              />
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <Field label="Priority" error={fieldErrors.priority}>
              <input 
                className="admin-input" 
                type="number" 
                min={0} 
                max={100} 
                value={form.priority}
                onChange={(e) => set("priority", Number(e.target.value))}
                disabled={saving}
              />
            </Field>
            <Field label="Publish Date" error={fieldErrors.startsAt}>
              <input 
                className="admin-input" 
                type="datetime-local" 
                value={form.startsAt}
                onChange={(e) => set("startsAt", e.target.value)}
                disabled={saving}
              />
            </Field>
            <Field label="Expiry Date" error={fieldErrors.endsAt}>
              <input 
                className="admin-input" 
                type="datetime-local" 
                value={form.endsAt}
                onChange={(e) => set("endsAt", e.target.value)}
                disabled={saving}
              />
            </Field>
          </div>

          <Field label="Tags">
            <input 
              className="admin-input" 
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)} 
              placeholder="fleet, maintenance, product"
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

          <div style={{ display: "flex", gap: 10, marginTop: 6, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
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
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label style={{
        fontSize: 11, fontWeight: 700, color: error ? "#ef4444" : "#64748b",
        textTransform: "uppercase", letterSpacing: "0.06em",
        display: "block", marginBottom: 5,
      }}>{label}</label>
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
  background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
  display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
};

const panelStyle: React.CSSProperties = {
  background: "var(--a-surface, #1E2433)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 16, padding: 28, width: "100%", maxWidth: 640,
  boxShadow: "0 24px 64px rgba(0,0,0,0.5)", maxHeight: "90vh", overflowY: "auto",
};

const iconBtnStyle: React.CSSProperties = {
  background: "none", border: "none", cursor: "pointer", color: "#64748b",
};
