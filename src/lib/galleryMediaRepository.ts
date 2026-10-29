import "server-only";

import { del, get, put } from "@vercel/blob";
import type { GalleryMedia } from "@/domain/entities/GalleryMedia";
import seedGallery from "@/infrastructure/data/gallery-media.json";

const GALLERY_DATA_PATH = "hmtkba/data/gallery-media.json";

const fallbackGallery = seedGallery as GalleryMedia[];
const hasBlobStorage = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

export const sortGalleryMedia = (items: GalleryMedia[]) =>
  [...items].sort((first, second) => {
    if (first.order !== second.order) return first.order - second.order;
    return second.occurredAt.localeCompare(first.occurredAt);
  });

export async function listGalleryMedia(): Promise<GalleryMedia[]> {
  if (!hasBlobStorage()) return sortGalleryMedia(fallbackGallery);

  try {
    const result = await get(GALLERY_DATA_PATH, { access: "public", useCache: false });
    if (!result?.stream) return sortGalleryMedia(fallbackGallery);
    const parsed = (await new Response(result.stream).json()) as GalleryMedia[];
    return Array.isArray(parsed) ? sortGalleryMedia(parsed) : sortGalleryMedia(fallbackGallery);
  } catch {
    return sortGalleryMedia(fallbackGallery);
  }
}

export async function saveGalleryMedia(items: GalleryMedia[]): Promise<void> {
  if (!hasBlobStorage()) {
    throw new Error("Penyimpanan galeri belum terhubung. Hubungkan Vercel Blob terlebih dahulu.");
  }

  await put(GALLERY_DATA_PATH, JSON.stringify(sortGalleryMedia(items)), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
    contentType: "application/json; charset=utf-8",
  });
}

function isManagedBlobUrl(value: string): boolean {
  return value.includes(".blob.vercel-storage.com/") && value.includes("/hmtkba/gallery-");
}

export async function deleteGalleryMediaAssets(item: Pick<GalleryMedia, "mediaUrl" | "thumbnailUrl">): Promise<void> {
  if (!hasBlobStorage()) return;
  const urls = [...new Set([item.mediaUrl, item.thumbnailUrl].filter(isManagedBlobUrl))];
  await Promise.all(urls.map(async (url) => {
    try {
      await del(url);
    } catch {
      // Metadata remains authoritative when a previously uploaded asset is already gone.
    }
  }));
}
