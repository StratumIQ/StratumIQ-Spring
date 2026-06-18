import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: "Invalid image format. Supported: jpg, jpeg, png, webp" },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File exceeds 5 MB limit" }, { status: 400 });
    }

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads", "fleet");
    await mkdir(dir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, name), buffer);

    return NextResponse.json({
      url: `/uploads/fleet/${name}`,
      file_name: file instanceof File ? file.name : name,
      file_size_bytes: file.size,
    });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
