import "server-only";

import { get, put } from "@vercel/blob";
import type { SiteContent } from "@/domain/entities/SiteContent";
import seedContent from "@/infrastructure/data/site-content.json";

const SITE_CONTENT_PATH = "hmtkba/data/site-content.json";
const fallbackContent = seedContent as SiteContent;

const cloneFallback = () => JSON.parse(JSON.stringify(fallbackContent)) as SiteContent;
const hasBlobStorage = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

export async function getSiteContent(): Promise<SiteContent> {
  if (!hasBlobStorage()) return cloneFallback();

  try {
    const result = await get(SITE_CONTENT_PATH, { access: "public", useCache: false });
    if (!result?.stream) return cloneFallback();
    const parsed = (await new Response(result.stream).json()) as SiteContent;
    return parsed?.theme && parsed?.home ? parsed : cloneFallback();
  } catch {
    return cloneFallback();
  }
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
  if (!hasBlobStorage()) {
    throw new Error("Penyimpanan konten website belum terhubung ke Vercel Blob.");
  }

  await put(SITE_CONTENT_PATH, JSON.stringify(content), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 30,
    contentType: "application/json; charset=utf-8",
  });
}
