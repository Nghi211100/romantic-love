import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import {
  FORMAT_ERROR_MESSAGE,
  isAllowedImageFile,
} from "@/utils/imageFile";

export const runtime = "nodejs";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "album");

function toPublicUrl(fileName: string) {
  return `/uploads/album/${fileName}`;
}

function safeFileName(originalName: string) {
  const ext = path.extname(originalName).toLowerCase();
  const base = path
    .basename(originalName, path.extname(originalName))
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 40);
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${stamp}-${base || "image"}${ext}`;
}

async function ensureUploadDir() {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
}

export async function GET() {
  try {
    await ensureUploadDir();
    const entries = await fs.readdir(UPLOAD_DIR, { withFileTypes: true });
    const images = entries
      .filter((entry) => entry.isFile() && entry.name !== ".gitkeep")
      .map((entry) => ({
        name: entry.name,
        url: toPublicUrl(entry.name),
      }))
      .sort((a, b) => b.name.localeCompare(a.name));

    return NextResponse.json({ images });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { images: [], message: "Không đọc được danh sách ảnh." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData
      .getAll("files")
      .filter((item): item is File => item instanceof File);

    if (!files.length) {
      return NextResponse.json(
        { message: "Chưa chọn file nào." },
        { status: 400 }
      );
    }

    const validFiles = files.filter((file) => isAllowedImageFile(file));
    const invalidNames = files
      .filter((file) => !isAllowedImageFile(file))
      .map((file) => file.name);

    if (!validFiles.length) {
      return NextResponse.json(
        {
          message: FORMAT_ERROR_MESSAGE,
          invalidNames,
        },
        { status: 400 }
      );
    }

    await ensureUploadDir();

    const uploaded = [];
    for (const file of validFiles) {
      const fileName = safeFileName(file.name);
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(path.join(UPLOAD_DIR, fileName), buffer);
      uploaded.push({
        name: fileName,
        url: toPublicUrl(fileName),
      });
    }

    return NextResponse.json({
      uploaded,
      invalidNames,
      message: invalidNames.length
        ? FORMAT_ERROR_MESSAGE
        : "Upload ảnh thành công.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Upload thất bại, thử lại nhé." },
      { status: 500 }
    );
  }
}
