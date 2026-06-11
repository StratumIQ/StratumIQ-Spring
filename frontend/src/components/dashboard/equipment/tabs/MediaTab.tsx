// FILE PATH: frontend/src/components/dashboard/equipment/tabs/MediaTab.tsx

"use client";

/**
 * MediaTab — StratumIQ
 * Layer F: Images, brochures, manuals, CAD, videos, spec sheets.
 */

import { useState } from "react";
import { DASH, BRAND } from "@/lib/constants";
import { equipmentAPI } from "../api/equipment.api";
import {
  Field, Input, Select, Toggle, SectionCard, FormGrid,
  IconBtn, Badge, EmptyState, useToast,
} from "../shared/EqUI";
import type { EquipmentSpec, Media, MediaType } from "@/types/equipment";

const MEDIA_TYPE_OPTS: { value: MediaType; label: string; icon: string }[] = [
  { value: "image",      label: "Image",        icon: "🖼️" },
  { value: "brochure",   label: "Brochure",     icon: "📄" },
  { value: "manual",     label: "Manual",       icon: "📖" },
  { value: "spec_sheet", label: "Spec Sheet",   icon: "📋" },
  { value: "cad",        label: "CAD Drawing",  icon: "📐" },
  { value: "video",      label: "Video",        icon: "🎬" },
];

const TYPE_ICON: Record<MediaType, string> = {
  image:      "🖼️",
  brochure:   "📄",
  manual:     "📖",
  spec_sheet: "📋",
  cad:        "📐",
  video:      "🎬",
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface MediaFormErrors {
  file_name?: string;
  file_url?: string;
  file_size_bytes?: string;
}

export default function MediaTab({ spec, onRefresh }: { spec: EquipmentSpec; onRefresh: () => void }) {
  const { show, ToastEl } = useToast();
  const id = spec.identity.equipment_id;
  const [media, setMedia] = useState<Media[]>(spec.media ?? []);
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState<MediaType | "">("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<MediaFormErrors>({});

  const [form, setForm] = useState({
    media_type:      "image" as MediaType,
    file_name:       "",
    file_url:        "",
    file_size_bytes: "",
    language:        "",
    version:         "",
    is_primary:      false,
    description:     "",
  });

  const set = (k: string) => (v: string | boolean) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k as keyof MediaFormErrors]) {
      setErrors(prev => ({ ...prev, [k]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: MediaFormErrors = {};
    
    if (!form.file_name || form.file_name.trim() === "") {
      newErrors.file_name = "File name is required";
    }
    
    if (!form.file_url || form.file_url.trim() === "") {
      newErrors.file_url = "File URL is required";
    } else if (!isValidUrl(form.file_url)) {
      newErrors.file_url = "Please enter a valid URL (e.g., https://...)";
    }
    
    if (form.file_size_bytes && form.file_size_bytes !== "") {
      const size = Number(form.file_size_bytes);
      if (isNaN(size) || size < 0 || size > 500 * 1024 * 1024) {
        newErrors.file_size_bytes = "File size must be between 0 and 500 MB";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleAdd = async () => {
    if (!validateForm()) {
      show("Please fix the errors above before adding", "error");
      return;
    }
    
    setSaving(true);
    try {
      const res = await equipmentAPI.media.upload(id, {
        media_type:      form.media_type,
        file_name:       form.file_name.trim(),
        file_url:        form.file_url.trim(),
        file_size_bytes: form.file_size_bytes ? Number(form.file_size_bytes) : undefined,
        language:        form.language?.trim() || undefined,
        version:         form.version?.trim() || undefined,
        is_primary:      form.is_primary,
        description:     form.description?.trim() || undefined,
      });
      setMedia(m => [...m, res.media]);
      setForm({ 
        media_type: "image", 
        file_name: "", 
        file_url: "", 
        file_size_bytes: "", 
        language: "", 
        version: "", 
        is_primary: false, 
        description: "" 
      });
      setAdding(false);
      setErrors({});
      show(`File "${form.file_name}" uploaded successfully!`, "success");
      onRefresh();
    } catch {
      show("Failed to upload media. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (mediaId: number, fileName: string) => {
    if (!confirm(`Delete "${fileName}"? This action cannot be undone.`)) return;
    try {
      await equipmentAPI.media.delete(id, mediaId);
      setMedia(m => m.filter(x => x.media_id !== mediaId));
      show(`File "${fileName}" deleted`, "success");
      onRefresh();
    } catch {
      show("Failed to delete media", "error");
    }
  };

  const handleSetPrimary = async (mediaId: number, currentIsPrimary: boolean) => {
    if (currentIsPrimary) {
      show("This file is already primary", "info");
      return;
    }
    try {
      await equipmentAPI.media.edit(id, mediaId, { is_primary: true });
      // Update local state to ensure only one primary per type
      const mediaItem = media.find(m => m.media_id === mediaId);
      if (mediaItem) {
        const updatedMedia = media.map(m => ({
          ...m,
          is_primary: m.media_type === mediaItem.media_type ? m.media_id === mediaId : m.is_primary
        }));
        setMedia(updatedMedia);
      }
      show("Primary file updated", "success");
      onRefresh();
    } catch {
      show("Failed to update primary status", "error");
    }
  };

  const filtered = filter ? media.filter(m => m.media_type === filter) : media;

  return (
    <>
      {ToastEl}

      <SectionCard
        title="Media & Documents"
        subtitle="Images, brochures, manuals, CAD files and videos"
        action={
          <button 
            onClick={() => {
              setAdding(a => !a);
              setErrors({});
            }} 
            className="btn-primary" 
            style={{ height: 32, padding: "0 14px", fontSize: 12 }}
          >
            {adding ? "Cancel" : "+ Upload Media"}
          </button>
        }
      >
        {/* Add form */}
        {adding && (
          <div style={{ 
            background: DASH.surface2, 
            borderRadius: 10, 
            padding: 16, 
            marginBottom: 16, 
            border: `1px solid ${DASH.border}` 
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: DASH.text, marginBottom: 12 }}>
              Add Media Record
            </div>
            <FormGrid cols={3}>
              <Field label="Media Type" required>
                <Select
                  value={form.media_type}
                  onChange={set("media_type") as (v: string) => void}
                  options={MEDIA_TYPE_OPTS.map(o => ({ value: o.value, label: `${o.icon} ${o.label}` }))}
                />
              </Field>
              <Field label="File Name" required error={errors.file_name}>
                <Input 
                  value={form.file_name} 
                  onChange={set("file_name") as (v: string) => void} 
                  placeholder="e.g. QJ341_Brochure_EN.pdf" 
                />
              </Field>
              <Field label="File Size (bytes)" hint="Optional - size in bytes" error={errors.file_size_bytes}>
                <Input 
                  type="number" 
                  value={form.file_size_bytes} 
                  onChange={set("file_size_bytes") as (v: string) => void} 
                  placeholder="e.g. 2048000" 
                />
              </Field>
              <Field label="File URL" required error={errors.file_url}>
                <Input 
                  value={form.file_url} 
                  onChange={set("file_url") as (v: string) => void} 
                  placeholder="https://cdn.example.com/file.pdf" 
                />
              </Field>
              <Field label="Language" hint="e.g., en, hi, fr">
                <Input 
                  value={form.language} 
                  onChange={set("language") as (v: string) => void} 
                  placeholder="e.g. en, hi" 
                />
              </Field>
              <Field label="Version" hint="File version number">
                <Input 
                  value={form.version} 
                  onChange={set("version") as (v: string) => void} 
                  placeholder="e.g. v2.1" 
                />
              </Field>
              <div style={{ gridColumn: "1/-1" }}>
                <Field label="Description" hint="Brief description of the file">
                  <Input 
                    value={form.description} 
                    onChange={set("description") as (v: string) => void} 
                    placeholder="Brief description of the file" 
                  />
                </Field>
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <Toggle 
                  checked={form.is_primary} 
                  onChange={set("is_primary") as (v: boolean) => void} 
                  label="Set as primary file for this media type" 
                />
              </div>
            </FormGrid>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
              <button 
                onClick={() => {
                  setAdding(false);
                  setErrors({});
                  setForm({ 
                    media_type: "image", 
                    file_name: "", 
                    file_url: "", 
                    file_size_bytes: "", 
                    language: "", 
                    version: "", 
                    is_primary: false, 
                    description: "" 
                  });
                }} 
                className="btn-secondary" 
                style={{ height: 34, padding: "0 18px", fontSize: 13 }}
              >
                Cancel
              </button>
              <button 
                onClick={handleAdd} 
                className="btn-primary" 
                style={{ height: 34, padding: "0 18px", fontSize: 13 }} 
                disabled={saving}
              >
                {saving ? "Uploading..." : "Upload Media"}
              </button>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        {media.length > 0 && (
          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
            <button
              onClick={() => setFilter("")}
              style={{
                height: 28, padding: "0 12px", borderRadius: 99,
                border: `1px solid ${filter === "" ? BRAND.orange : DASH.border}`,
                background: filter === "" ? `${BRAND.orange}15` : "transparent",
                color: filter === "" ? BRAND.orange : DASH.text3,
                fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              All ({media.length})
            </button>
            {MEDIA_TYPE_OPTS.map(t => {
              const count = media.filter(m => m.media_type === t.value).length;
              if (count === 0) return null;
              return (
                <button
                  key={t.value}
                  onClick={() => setFilter(t.value)}
                  style={{
                    height: 28, padding: "0 12px", borderRadius: 99,
                    border: `1px solid ${filter === t.value ? BRAND.orange : DASH.border}`,
                    background: filter === t.value ? `${BRAND.orange}15` : "transparent",
                    color: filter === t.value ? BRAND.orange : DASH.text3,
                    fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  {t.icon} {t.label} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Media grid */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="📁"
            title="No media uploaded yet"
            desc="Add brochures, images, manuals, CAD files and more"
            action={
              <button 
                onClick={() => setAdding(true)} 
                className="btn-primary" 
                style={{ height: 34, padding: "0 16px", fontSize: 13 }}
              >
                Upload First File
              </button>
            }
          />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {filtered.map(m => (
              <div 
                key={m.media_id} 
                style={{
                  border: `1px solid ${DASH.border}`,
                  borderRadius: 10, overflow: "hidden",
                  background: DASH.surface2,
                  transition: "all .15s",
                }}
                onMouseOver={e => (e.currentTarget as HTMLElement).style.borderColor = BRAND.orange + "60"}
                onMouseOut={e => (e.currentTarget as HTMLElement).style.borderColor = DASH.border}
              >
                {/* Preview area */}
                <div style={{
                  height: 100, background: DASH.surface,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  borderBottom: `1px solid ${DASH.border}`,
                  position: "relative",
                }}>
                  {m.media_type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={m.file_url} 
                      alt={m.file_name} 
                      style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} 
                    />
                  ) : (
                    <div style={{ fontSize: 36 }}>{TYPE_ICON[m.media_type]}</div>
                  )}
                  {m.is_primary && (
                    <span style={{
                      position: "absolute", top: 6, left: 6,
                      fontSize: 9, fontWeight: 800, color: "#fff",
                      background: BRAND.orange, padding: "2px 6px", borderRadius: 99,
                      letterSpacing: "0.06em",
                    }}>PRIMARY</span>
                  )}
                  <div style={{ position: "absolute", top: 6, right: 6 }}>
                    <IconBtn 
                      onClick={() => handleDelete(m.media_id, m.file_name)} 
                      danger 
                      title="Delete file"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                      </svg>
                    </IconBtn>
                  </div>
                  {!m.is_primary && (
                    <div style={{ position: "absolute", bottom: 6, right: 6 }}>
                      <IconBtn 
                        onClick={() => handleSetPrimary(m.media_id, m.is_primary)} 
                        title="Set as primary"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                        </svg>
                      </IconBtn>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: "10px 12px" }}>
                  <div style={{ 
                    fontSize: 12.5, fontWeight: 700, color: DASH.text, 
                    marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" 
                  }}>
                    {m.file_name}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <Badge label={m.media_type} variant="draft" />
                    {m.language && <span style={{ fontSize: 10, color: DASH.text3, fontWeight: 600 }}>{m.language.toUpperCase()}</span>}
                    {m.version && <span style={{ fontSize: 10, color: DASH.text3 }}>{m.version}</span>}
                    {m.file_size_bytes && <span style={{ fontSize: 10, color: DASH.text3, marginLeft: "auto" }}>{formatBytes(m.file_size_bytes)}</span>}
                  </div>
                  {m.description && (
                    <div style={{ fontSize: 11.5, color: DASH.text3, marginTop: 4, lineHeight: 1.4 }}>
                      {m.description}
                    </div>
                  )}
                  <a 
                    href={m.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ display: "block", marginTop: 8, fontSize: 12, color: BRAND.orange, fontWeight: 600, textDecoration: "none" }}
                  >
                    Open file →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </>
  );
}