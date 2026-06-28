"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { resolveAssetUrl } from "@/lib/constants";
import { cropAndCompress, uploadMarketingImage } from "@/lib/imageUtils";

type Props = {
  label:        string;
  value:        string;
  onChange:     (url: string) => void;
  aspectRatio?: number;
  hint?:        string;
  disabled?:    boolean;
};

export default function MarketingImageField({
  label, value, onChange, aspectRatio = 16 / 9, hint, disabled = false,
}: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFile = async (file: File) => {
    if (disabled || uploading) return;
    setError(null);
    setUploading(true);
    setProgress(12);
    try {
      const processed = await cropAndCompress(file, aspectRatio, 1920, 0.82);
      setProgress(55);
      const url = await uploadMarketingImage(processed);
      setProgress(100);
      onChange(url);
      toast.success(`${label} uploaded successfully`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
      window.setTimeout(() => setProgress(0), 400);
    }
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  const resolved = resolveAssetUrl(value);

  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div
        role="button"
        tabIndex={disabled || uploading ? -1 : 0}
        onClick={() => {
          if (!disabled && !uploading) ref.current?.click();
        }}
        onKeyDown={(e) => {
          if (!disabled && !uploading && (e.key === "Enter" || e.key === " ")) ref.current?.click();
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled && !uploading) setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${resolved ? "#E8692C" : dragActive ? "#E8692C" : "rgba(15,23,42,0.14)"}`,
          borderRadius: 12,
          overflow: "hidden",
          minHeight: resolved ? 180 : 112,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: disabled || uploading ? "not-allowed" : "pointer",
          position: "relative",
          background: resolved ? "rgba(255,247,242,0.92)" : dragActive ? "rgba(232,105,44,0.06)" : "#fff",
          opacity: disabled ? 0.6 : 1,
          boxShadow: resolved ? "inset 0 0 0 1px rgba(232,105,44,0.14)" : "none",
        }}
      >
        {resolved ? (
          <>
            <Image src={resolved} alt={label} fill style={{ objectFit: "cover" }} />
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.6) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  ref.current?.click();
                }}
                style={actionButtonStyle}
              >
                <RefreshCw size={14} /> Replace
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onChange("");
                }}
                style={{ ...actionButtonStyle, background: "rgba(239,68,68,0.9)" }}
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>
          </>
        ) : uploading ? (
          <div style={{ textAlign: "center", color: "#475569", padding: 16 }}>
            <Loader2 size={24} className="auth-spin" color="#E8692C" />
            <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700 }}>Uploading…</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>Optimizing for the dashboard</div>
            <div style={{ marginTop: 10, width: 180, height: 6, background: "rgba(15,23,42,0.08)", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #E8692C, #fb923c)", transition: "width 0.2s ease" }} />
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", color: "#64748b", padding: 16 }}>
            <UploadCloud size={24} style={{ marginBottom: 8, color: "#E8692C" }} />
            <div style={{ fontSize: 12, fontWeight: 700 }}>Upload from device</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>PNG, JPG, JPEG, or WebP · up to 5 MB</div>
            {hint && <div style={{ fontSize: 11, marginTop: 4, color: "#94a3b8" }}>{hint}</div>}
          </div>
        )}
      </div>
      {error && <div style={{ marginTop: 6, fontSize: 11, color: "#dc2626" }}>{error}</div>}
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }}
        disabled={disabled || uploading}
        onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleFile(file); event.target.value = ""; }} />
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  display: "block",
  marginBottom: 6,
};

const actionButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: 999,
  background: "rgba(255,255,255,0.92)",
  color: "#111827",
  padding: "8px 10px",
  fontSize: 11,
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  cursor: "pointer",
};
