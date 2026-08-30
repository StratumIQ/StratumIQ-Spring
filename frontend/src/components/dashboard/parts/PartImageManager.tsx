"use client";

import { useState } from "react";
import { Loader2, Star, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { compressImage, isValidImageType, uploadImage } from "@/lib/imageUtils";
import { resolveAssetUrl } from "@/lib/constants";
import type { PartImage } from "@/lib/api/parts";

type Props = {
  images: PartImage[];
  onChange: (images: PartImage[]) => void;
  disabled?: boolean;
};

export default function PartImageManager({ images, onChange, disabled }: Props) {
  const [uploading, setUploading] = useState(false);

  const addFiles = async (files: FileList | null) => {
    if (!files?.length || disabled) return;
    setUploading(true);
    try {
      const next = [...images];
      for (const file of Array.from(files)) {
        if (!isValidImageType(file.type)) {
          toast.error(`${file.name}: use JPG, PNG, or WebP`);
          continue;
        }
        const processed = await compressImage(file);
        const url = await uploadImage(processed, "parts");
        next.push({
          imageUrl: url,
          displayOrder: next.length,
          primary: next.length === 1,
        });
      }
      if (next.length && !next.some((i) => i.primary)) next[0].primary = true;
      onChange(next);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const remove = (index: number) => {
    const next = images.filter((_, i) => i !== index).map((img, i) => ({ ...img, displayOrder: i }));
    if (next.length && !next.some((i) => i.primary)) next[0].primary = true;
    onChange(next);
  };

  const setPrimary = (index: number) => {
    onChange(images.map((img, i) => ({ ...img, primary: i === index })));
  };

  return (
    <div>
      <div className="d-part-images-grid">
        {images.map((img, i) => (
          <div key={`${img.imageUrl}-${i}`} className={`d-part-image-tile${img.primary ? " is-primary" : ""}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resolveAssetUrl(img.imageUrl) ?? img.imageUrl} alt="" />
            <div className="d-part-image-actions">
              <button type="button" onClick={() => setPrimary(i)} title="Set as main" disabled={disabled}>
                <Star size={14} fill={img.primary ? "currentColor" : "none"} />
              </button>
              <button type="button" onClick={() => remove(i)} title="Remove" disabled={disabled}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        <label className="d-part-image-add">
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            hidden
            disabled={disabled || uploading}
            onChange={(e) => {
              void addFiles(e.target.files);
              e.target.value = "";
            }}
          />
          {uploading ? <Loader2 size={18} className="d-spin" /> : <Upload size={18} />}
          <span>{uploading ? "Uploading…" : "Add images"}</span>
        </label>
      </div>
    </div>
  );
}
