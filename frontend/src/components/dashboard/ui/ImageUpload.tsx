"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, ImageIcon, Loader2, RefreshCw } from "lucide-react";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { API_URL, resolveAssetUrl } from "@/lib/constants";
import { getAccessToken } from "@/lib/auth/token";

const ACCEPT = "image/jpeg,image/jpg,image/png,image/webp";
const MAX_BYTES = 5 * 1024 * 1024;

type Props = {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
};

export default function ImageUpload({
  value,
  onChange,
  label = "Equipment Photo",
  hint = "Drag and drop or click to upload. JPG, PNG, or WebP up to 5 MB.",
  disabled,
  className,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!ACCEPT.split(",").includes(file.type)) {
        const msg = "Invalid image format. Use JPG, PNG, or WebP.";
        setError(msg);
        notify.error(msg);
        return;
      }

      if (file.size > MAX_BYTES) {
        const msg = "Image must be under 5 MB.";
        setError(msg);
        notify.error(msg);
        return;
      }

      setUploading(true);
      setProgress(10);

      try {
        const form = new FormData();
        form.append("file", file);

        const tick = window.setInterval(() => {
          setProgress((p) => Math.min(p + 12, 88));
        }, 120);

        const token = getAccessToken();
        const uploadHeaders: Record<string, string> = {};
        if (token) uploadHeaders.Authorization = `Bearer ${token}`;

        const res = await fetch(`${API_URL}/upload`, {
          method: "POST",
          credentials: "include",
          headers: uploadHeaders,
          body: form,
        });
        window.clearInterval(tick);

        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !data.url) {
          throw new Error(data.error ?? "Upload failed");
        }

        setProgress(100);
        onChange(data.url);
        notify.success("Image uploaded successfully");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unable to upload image";
        setError(msg);
        notify.error(msg);
      } finally {
        setUploading(false);
        setTimeout(() => setProgress(0), 400);
      }
    },
    [onChange],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (disabled || uploading) return;
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const remove = () => {
    onChange(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={cn("d-image-upload", className)}>
      {label && (
        <div className="d-image-upload-label">
          <span>{label}</span>
          <span className="d-image-upload-optional">Optional</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="d-image-upload-input"
        disabled={disabled || uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadFile(file);
        }}
      />

      <AnimatePresence mode="wait">
        {value ? (
          <motion.div
            key="preview"
            className="d-image-upload-preview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
          >
            <img src={resolveAssetUrl(value) ?? value} alt="Upload preview" />
            <div className="d-image-upload-preview-actions">
              <button
                type="button"
                className="d-image-upload-action"
                disabled={disabled || uploading}
                onClick={() => inputRef.current?.click()}
                aria-label="Replace image"
              >
                <RefreshCw size={14} />
                Replace
              </button>
              <button
                type="button"
                className="d-image-upload-action d-image-upload-action--danger"
                disabled={disabled || uploading}
                onClick={remove}
                aria-label="Remove image"
              >
                <X size={14} />
                Remove
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            className={cn("d-image-upload-dropzone", dragging && "d-image-upload-dropzone--active")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={(e) => {
              e.preventDefault();
              if (!disabled && !uploading) setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => !disabled && !uploading && inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
          >
            {uploading ? (
              <>
                <Loader2 size={28} className="d-spin" />
                <span className="d-image-upload-text">Uploading…</span>
                <div className="d-image-upload-progress">
                  <motion.div
                    className="d-image-upload-progress-bar"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="d-image-upload-icon-wrap">
                  {dragging ? <Upload size={26} /> : <ImageIcon size={26} />}
                </div>
                <span className="d-image-upload-text">Upload from device</span>
                <span className="d-image-upload-sub">Drag and drop or click to browse</span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {hint && !error && <p className="d-image-upload-hint">{hint}</p>}
      {error && <p className="d-image-upload-error">{error}</p>}
    </div>
  );
}
