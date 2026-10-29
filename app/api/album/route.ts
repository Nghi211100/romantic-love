import { NextRequest, NextResponse } from "next/server";
import { get, list, put } from "@vercel/blob";
import {
  FORMAT_ERROR_MESSAGE,
  isAllowedImageFile,
} from "@/utils/imageFile";
import {
  CAPTIONS_BLOB_PATH,
  CaptionMap,
  formatDateVN,
  isCaptionsSidecar,
  normalizeCaption,
  parseCaptionMap,
} from "@/utils/albumCaption";

export const runtime = "nodejs";

const BLOB_PREFIX = "album/";

function blobFileName(pathname: string) {
  return pathname.startsWith(BLOB_PREFIX)
    ? pathname.slice(BLOB_PREFIX.length)
    : pathname;
}

function safeBlobPathname(originalName: string) {
  const lastDot = originalName.lastIndexOf(".");
  const ext = lastDot >= 0 ? originalName.slice(lastDot).toLowerCase() : "";
  const rawBase =
    lastDot >= 0 ? originalName.slice(0, lastDot) : originalName;
  const base = rawBase.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 40);
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${BLOB_PREFIX}${stamp}-${base || "image"}${ext}`;
}

function numberedAlbumIndex(name: string) {
  const match = name.match(/^(\d+)\.jpe?g$/i);
  return match ? Number(match[1]) : null;
}

function sortAlbumImages<T extends { name: string }>(images: T[]) {
  return [...images].sort((a, b) => {
    const aNum = numberedAlbumIndex(a.name);
    const bNum = numberedAlbumIndex(b.name);
    if (aNum !== null && bNum !== null) return aNum - bNum;
    if (aNum !== null) return -1;
    if (bNum !== null) return 1;
    return b.name.localeCompare(a.name);
  });
}

async function putAlbumBlob(
  pathname: string,
  body: Buffer,
  token: string,
  extra?: { contentType?: string; allowOverwrite?: boolean }
) {
  const options = {
    addRandomSuffix: false as const,
    token,
    contentType: extra?.contentType,
    allowOverwrite: extra?.allowOverwrite,
  };

  try {
    return await put(pathname, body, { ...options, access: "public" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!message.toLowerCase().includes("private")) {
      throw error;
    }
    return await put(pathname, body, { ...options, access: "private" });
  }
}

async function streamToText(stream: ReadableStream<Uint8Array>) {
  return new Response(stream).text();
}

async function loadCaptions(token: string): Promise<CaptionMap> {
  try {
    const result = await get(CAPTIONS_BLOB_PATH, {
      access: "private",
      token,
    });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return {};
    }
    return parseCaptionMap(await streamToText(result.stream));
  } catch {
    return {};
  }
}

async function saveCaptions(token: string, captions: CaptionMap) {
  await putAlbumBlob(
    CAPTIONS_BLOB_PATH,
    Buffer.from(JSON.stringify({ captions }, null, 2), "utf8"),
    token,
    { contentType: "application/json", allowOverwrite: true }
  );
}

export async function GET() {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { images: [], message: "Thiếu cấu hình lưu trữ ảnh." },
        { status: 500 }
      );
    }

    const [{ blobs }, captions] = await Promise.all([
      list({ prefix: BLOB_PREFIX, token }),
      loadCaptions(token),
    ]);

    const images = sortAlbumImages(
      blobs
        .filter((blob) => !isCaptionsSidecar(blobFileName(blob.pathname)))
        .map((blob) => {
          const name = blobFileName(blob.pathname);
          const uploadedAt = blob.uploadedAt
            ? new Date(blob.uploadedAt)
            : new Date();
          return {
            name,
            url: blob.url,
            caption:
              typeof captions[name] === "string"
                ? captions[name]
                : formatDateVN(uploadedAt),
          };
        })
    );

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
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { message: "Thiếu cấu hình lưu trữ ảnh." },
        { status: 500 }
      );
    }

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

    const uploaded = [];
    const today = formatDateVN();
    const captions = await loadCaptions(token);

    for (const file of validFiles) {
      const pathname = safeBlobPathname(file.name);
      const blob = await putAlbumBlob(
        pathname,
        Buffer.from(await file.arrayBuffer()),
        token,
        { contentType: file.type || undefined }
      );
      const name = blobFileName(blob.pathname);
      captions[name] = today;
      uploaded.push({
        name,
        url: blob.url,
        caption: today,
      });
    }

    await saveCaptions(token, captions);

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

export async function PATCH(request: NextRequest) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { message: "Thiếu cấu hình lưu trữ ảnh." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as {
      name?: string;
      caption?: string;
    };
    const name = (body.name || "").trim();
    if (!name || name.includes("..") || name.includes("\\") || name.includes("/")) {
      return NextResponse.json(
        { message: "Tên ảnh không hợp lệ." },
        { status: 400 }
      );
    }
    if (isCaptionsSidecar(name)) {
      return NextResponse.json(
        { message: "Không sửa được chú thích này." },
        { status: 400 }
      );
    }

    const caption = normalizeCaption(body.caption || "");
    const captions = await loadCaptions(token);
    captions[name] = caption;
    await saveCaptions(token, captions);

    return NextResponse.json({ name, caption });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Không lưu được chú thích." },
      { status: 500 }
    );
  }
}
