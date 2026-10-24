import "server-only";

import { del, get, put } from "@vercel/blob";
import type { ManualCompetition } from "@/domain/entities/ManualCompetition";

const DATA_PATH = "hmtkba/data/manual-competitions.json";
const MEDIA_PREFIX = "hmtkba/competition-media";

const hasBlobStorage = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

const sortItems = (items: ManualCompetition[]) =>
  [...items].sort((first, second) => {
    if (first.isPublished !== second.isPublished) return Number(second.isPublished) - Number(first.isPublished);
    return second.updatedAt.localeCompare(first.updatedAt);
  });

export async function listManualCompetitions(): Promise<ManualCompetition[]> {
  if (!hasBlobStorage()) return [];

  try {
    const result = await get(DATA_PATH, { access: "public", useCache: false });
    if (!result?.stream) return [];
    const parsed = (await new Response(result.stream).json()) as ManualCompetition[];
    return Array.isArray(parsed) ? sortItems(parsed) : [];
  } catch {
    return [];
  }
}

export async function saveManualCompetitions(items: ManualCompetition[]): Promise<void> {
  if (!hasBlobStorage()) {
    throw new Error("Penyimpanan lomba manual belum terhubung. Hubungkan Vercel Blob terlebih dahulu.");
  }

  await put(DATA_PATH, JSON.stringify(sortItems(items)), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
    contentType: "application/json; charset=utf-8",
  });
}

export async function uploadManualCompetitionImage(file: File): Promise<string> {
  if (!hasBlobStorage()) throw new Error("Penyimpanan poster lomba belum terhubung.");
  const extension = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "jpg";
  const uploaded = await put(`${MEDIA_PREFIX}/${Date.now()}-${crypto.randomUUID()}.${extension}`, file, {
    access: "public",
    addRandomSuffix: false,
    contentType: file.type,
    cacheControlMaxAge: 60 * 60 * 24 * 30,
  });
  return uploaded.url;
}

export async function deleteManualCompetitionImage(imageUrl: string): Promise<void> {
  if (!hasBlobStorage() || !imageUrl.includes(".blob.vercel-storage.com/")) return;
  try {
    await del(imageUrl);
  } catch {
    // The competition record can still be updated if an old poster no longer exists.
  }
}
