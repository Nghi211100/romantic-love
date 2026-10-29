import { NextResponse } from "next/server";
import { get } from "@vercel/blob";

export const runtime = "nodejs";

const BLOB_PREFIX = "album/";

function safePathname(segments: string[]) {
  if (!segments.length) return null;
  if (segments.some((part) => !part || part === "." || part === "..")) {
    return null;
  }
  const joined = segments.join("/");
  if (joined.includes("\\")) return null;
  return `${BLOB_PREFIX}${joined}`;
}

export async function GET(
  _request: Request,
  context: { params: { pathname: string[] } }
) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { message: "Thiếu cấu hình lưu trữ ảnh." },
        { status: 500 }
      );
    }

    const pathname = safePathname(context.params.pathname || []);
    if (!pathname || pathname.endsWith("/captions.json")) {
      return NextResponse.json({ message: "Ảnh không hợp lệ." }, { status: 400 });
    }

    const result = await get(pathname, {
      access: "private",
      token,
    });

    if (!result || result.statusCode !== 200 || !result.stream) {
      return NextResponse.json({ message: "Không tìm thấy ảnh." }, { status: 404 });
    }

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType || "application/octet-stream",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Không đọc được ảnh." },
      { status: 500 }
    );
  }
}
