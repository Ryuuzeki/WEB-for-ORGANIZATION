import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getAdminSessionAction } from "@/application/actions/adminActions";

const IMAGE_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const VIDEO_CONTENT_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov"]);
const SAFE_PATHNAME = /^hmtkba\/(gallery-media|gallery-thumbnails)\/[a-zA-Z0-9._-]{1,180}\.(jpg|jpeg|png|webp|gif|mp4|webm|mov)$/i;
const TOKEN_WINDOW_MS = 10 * 60 * 1000;
const MAX_TOKENS_PER_WINDOW = 60;

type UploadTokenGlobals = typeof globalThis & {
  __hmtkbaGalleryUploadTokens?: Map<string, { count: number; startedAt: number }>;
};

const uploadTokens = ((globalThis as UploadTokenGlobals).__hmtkbaGalleryUploadTokens ??= new Map());

function hasSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  return Boolean(origin && origin === new URL(request.url).origin && (!fetchSite || fetchSite === "same-origin"));
}

function consumeUploadToken(key: string): boolean {
  const now = Date.now();
  const existing = uploadTokens.get(key);
  const current = !existing || now - existing.startedAt > TOKEN_WINDOW_MS
    ? { count: 0, startedAt: now }
    : existing;
  current.count += 1;
  uploadTokens.set(key, current);
  return current.count <= MAX_TOKENS_PER_WINDOW;
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (contentLength > 64 * 1024) {
      return NextResponse.json({ error: "Permintaan terlalu besar." }, { status: 413 });
    }

    const body = (await request.json()) as HandleUploadBody;
    if (body.type !== "blob.generate-client-token" || !hasSameOrigin(request)) {
      return NextResponse.json({ error: "Permintaan unggahan tidak valid." }, { status: 403 });
    }

    const session = await getAdminSessionAction();
    if (!session?.isSuperAdmin) {
      return NextResponse.json({ error: "Hanya Superadmin yang dapat mengunggah galeri." }, { status: 403 });
    }

    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!consumeUploadToken(`${forwarded}:${session.divisionSlug}`)) {
      return NextResponse.json({ error: "Terlalu banyak unggahan. Coba lagi beberapa menit." }, { status: 429 });
    }

    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const extension = pathname.split(".").pop()?.toLowerCase() ?? "";
        if (!SAFE_PATHNAME.test(pathname)) throw new Error("Nama atau lokasi berkas tidak valid.");

        const isThumbnail = pathname.startsWith("hmtkba/gallery-thumbnails/");
        if (isThumbnail && !IMAGE_EXTENSIONS.has(extension)) {
          throw new Error("Sampul video harus berupa gambar JPG, PNG, WebP, atau GIF.");
        }
        if (!isThumbnail && !IMAGE_EXTENSIONS.has(extension) && !VIDEO_EXTENSIONS.has(extension)) {
          throw new Error("Format media tidak didukung.");
        }

        const isVideo = VIDEO_EXTENSIONS.has(extension);
        return {
          allowedContentTypes: isVideo ? VIDEO_CONTENT_TYPES : IMAGE_CONTENT_TYPES,
          maximumSizeInBytes: isVideo ? 200 * 1024 * 1024 : 12 * 1024 * 1024,
          addRandomSuffix: false,
          allowOverwrite: false,
          cacheControlMaxAge: 60 * 60 * 24 * 30,
          tokenPayload: JSON.stringify({ divisionSlug: session.divisionSlug, mediaKind: isVideo ? "video" : "image" }),
        };
      },
    });

    return NextResponse.json(response);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal menyiapkan unggahan galeri." },
      { status: 400 },
    );
  }
}
