import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getAdminSessionAction } from "@/application/actions/adminActions";

const MAX_DOCUMENT_SIZE = 25 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(["pdf", "doc", "docx", "xls", "xlsx", "zip"]);
const ALLOWED_CONTENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "application/x-zip-compressed",
];
const SAFE_PATHNAME = /^hmtkba\/uploads\/[a-zA-Z0-9._-]{1,180}\.(pdf|doc|docx|xls|xlsx|zip)$/i;
const TOKEN_WINDOW_MS = 10 * 60 * 1000;
const MAX_TOKENS_PER_WINDOW = 30;

type UploadTokenGlobals = typeof globalThis & {
  __hmtkbaUploadTokens?: Map<string, { count: number; startedAt: number }>;
};

const uploadTokens = ((globalThis as UploadTokenGlobals).__hmtkbaUploadTokens ??= new Map());

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
    if (!session) {
      return NextResponse.json({ error: "Sesi admin sudah berakhir. Silakan masuk kembali." }, { status: 401 });
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
        if (!SAFE_PATHNAME.test(pathname) || !ALLOWED_EXTENSIONS.has(extension)) {
          throw new Error("Jenis berkas tidak didukung.");
        }

        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_DOCUMENT_SIZE,
          addRandomSuffix: false,
          allowOverwrite: false,
          cacheControlMaxAge: 60 * 60 * 24 * 30,
          tokenPayload: JSON.stringify({ divisionSlug: session.divisionSlug }),
        };
      },
    });

    return NextResponse.json(response);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal menyiapkan unggahan dokumen." },
      { status: 400 },
    );
  }
}
