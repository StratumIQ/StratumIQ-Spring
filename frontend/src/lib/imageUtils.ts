/**
 * Client-side image compression and crop utilities (Canvas API — no extra deps).
 */

const ACCEPT_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

export function isValidImageType(type: string): boolean {
  return ACCEPT_TYPES.includes(type);
}

export async function compressImage(
  file: File,
  maxWidth = 1920,
  quality = 0.82,
): Promise<File> {
  if (!isValidImageType(file.type)) throw new Error("Invalid image format");
  if (file.size <= MAX_BYTES && file.type === "image/jpeg") return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Compression failed"))),
      "image/jpeg",
      quality,
    );
  });

  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg" });
}

/** Center-crop to aspect ratio then compress */
export async function cropAndCompress(
  file: File,
  aspectRatio: number,
  maxWidth = 1920,
  quality = 0.82,
): Promise<File> {
  if (!isValidImageType(file.type)) throw new Error("Invalid image format");

  const bitmap = await createImageBitmap(file);
  const srcW = bitmap.width;
  const srcH = bitmap.height;
  const srcAspect = srcW / srcH;

  let cropW = srcW;
  let cropH = srcH;
  if (srcAspect > aspectRatio) {
    cropW = Math.round(srcH * aspectRatio);
  } else {
    cropH = Math.round(srcW / aspectRatio);
  }
  const sx = Math.round((srcW - cropW) / 2);
  const sy = Math.round((srcH - cropH) / 2);

  const scale = Math.min(1, maxWidth / cropW);
  const w = Math.round(cropW * scale);
  const h = Math.round(cropH * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, sx, sy, cropW, cropH, 0, 0, w, h);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Crop failed"))),
      "image/jpeg",
      quality,
    );
  });

  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg" });
}

export async function uploadMarketingImage(file: File): Promise<string> {
  const { API_URL } = await import("@/lib/constants");
  const { getAccessToken } = await import("@/lib/auth/token");

  const form = new FormData();
  form.append("file", file);

  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}/upload?folder=marketing`, {
    method: "POST",
    credentials: "include",
    headers,
    body: form,
  });

  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !data.url) {
    throw new Error(data.error ?? "Upload failed");
  }
  return data.url;
}
