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
  "application/octet-stream",
];

export async function POST(request: Request) {
  const session = await getAdminSessionAction();
  if (!session) {
    return NextResponse.json({ error: "Sesi admin sudah berakhir. Silakan masuk kembali." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as HandleUploadBody;
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const extension = pathname.split(".").pop()?.toLowerCase() ?? "";
        if (!pathname.startsWith("hmtkba/uploads/") || !ALLOWED_EXTENSIONS.has(extension)) {
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
