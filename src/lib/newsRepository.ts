import "server-only";

import { del, get, put } from "@vercel/blob";
import type { NewsItem } from "@/domain/entities/NewsItem";
import seedNews from "@/infrastructure/data/news.json";
import { safeImageExtension, validateImageFile } from "@/lib/uploadSecurity";

const NEWS_DATA_PATH = "hmtkba/data/news.json";
const NEWS_MEDIA_PREFIX = "hmtkba/news-media";

const fallbackNews = seedNews as NewsItem[];

const sortNews = (items: NewsItem[]) =>
  [...items].sort((first, second) => {
    if (first.order !== second.order) return first.order - second.order;
    return second.publishedAt.localeCompare(first.publishedAt);
  });

const hasBlobStorage = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

export async function listNewsItems(): Promise<NewsItem[]> {
  if (!hasBlobStorage()) return sortNews(fallbackNews);

  try {
    const result = await get(NEWS_DATA_PATH, { access: "public", useCache: false });
    if (!result?.stream) return sortNews(fallbackNews);
    const parsed = (await new Response(result.stream).json()) as NewsItem[];
    return Array.isArray(parsed) ? sortNews(parsed) : sortNews(fallbackNews);
  } catch {
    return sortNews(fallbackNews);
  }
}

export async function saveNewsItems(items: NewsItem[]): Promise<void> {
  if (!hasBlobStorage()) {
    throw new Error("Penyimpanan berita belum terhubung. Hubungkan Vercel Blob terlebih dahulu.");
  }

  await put(NEWS_DATA_PATH, JSON.stringify(sortNews(items)), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 60,
    contentType: "application/json; charset=utf-8",
  });
}

export async function uploadNewsImage(file: File): Promise<string> {
  if (!hasBlobStorage()) {
    throw new Error("Penyimpanan gambar berita belum terhubung.");
  }

  await validateImageFile(file, 4 * 1024 * 1024);
  const extension = safeImageExtension(file.type.toLowerCase());
  const filename = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const uploaded = await put(`${NEWS_MEDIA_PREFIX}/${filename}`, file, {
    access: "public",
    addRandomSuffix: false,
    contentType: file.type,
    cacheControlMaxAge: 60 * 60 * 24 * 30,
  });
  return uploaded.url;
}

export async function deleteNewsImage(imageUrl: string): Promise<void> {
  if (!hasBlobStorage() || !imageUrl.includes(".blob.vercel-storage.com/")) return;
  try {
    await del(imageUrl);
  } catch {
    // Metadata deletion should still succeed if the old image is already gone.
  }
}
