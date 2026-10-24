import "server-only";

import { unstable_cache } from "next/cache";
import type { CompetitionFeed, CompetitionListing } from "@/domain/entities/CompetitionListing";

const SOURCE_ORIGIN = "https://www.infolomba.id";
const SOURCE_ENDPOINT = `${SOURCE_ORIGIN}/load-event-2`;
const PAGE_SIZE = 5;
const MAX_PAGES = 6;

const decodeHtml = (value: string) =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

const matchText = (segment: string, expression: RegExp) => {
  const match = segment.match(expression);
  return match?.[1] ? decodeHtml(match[1]) : "";
};

function parseListings(html: string): CompetitionListing[] {
  return html
    .split('<div class="event-container')
    .slice(1)
    .map((segment) => {
      const identity = segment.match(/loadDetailsEvent\((\d+),\s*`([^`]+)`/);
      const imagePath = segment.match(/class="img-container"[\s\S]*?<img\s+src="([^"]+)"/)?.[1] ?? "";
      const id = identity?.[1] ?? "";
      const slug = identity?.[2] ?? "";
      const audience = matchText(segment, /<div class="target[^>]*>[\s\S]*?<img[^>]*>([\s\S]*?)<\/div>/);

      return {
        id,
        title: matchText(segment, /<h4[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/),
        audience,
        fee: matchText(segment, /<div class="biaya[^>]*>[\s\S]*?<img[^>]*>([\s\S]*?)<\/div>/),
        mode: matchText(segment, /<div class="lokasi[^>]*>[\s\S]*?<img[^>]*>([\s\S]*?)<\/div>/),
        dateText: matchText(segment, /<div class="tanggal[^>]*>[\s\S]*?<img[^>]*>([\s\S]*?)<\/div>/),
        organizer: matchText(segment, /<div class="penyelenggara">[\s\S]*?<br>\s*<span>([\s\S]*?)<\/span>/),
        sourceUrl: id && slug ? `${SOURCE_ORIGIN}/${slug}-${id}` : `${SOURCE_ORIGIN}/events?peserta=5`,
        imageUrl: imagePath ? new URL(imagePath, `${SOURCE_ORIGIN}/`).toString() : "",
        isClosed: /^\s+event-past/.test(segment),
      } satisfies CompetitionListing;
    })
    .filter((item) => item.id && item.title && item.audience.toLowerCase().includes("mahasiswa"));
}

async function fetchStudentCompetitions(): Promise<CompetitionFeed> {
  const listings: CompetitionListing[] = [];
  let sourceAvailable = false;

  try {
    for (let page = 0; page < MAX_PAGES; page += 1) {
      const body = new URLSearchParams({
        start: String(page * PAGE_SIZE),
        sort: "Default",
        title: "",
        peserta: "5",
        lokasi: "Semua Lokasi",
        kategori: "Semua Kategori",
        is_online: "Semua",
        active_id: "",
      });
      const response = await fetch(SOURCE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "HMTKBA Student Competition Portal/1.0 (+https://hmtkba.vercel.app/portal-lomba)",
        },
        body,
        signal: AbortSignal.timeout(12_000),
      });
      if (!response.ok) throw new Error(`InfoLomba merespons ${response.status}`);
      sourceAvailable = true;
      const payload = (await response.json()) as { html?: string; event_count?: number };
      listings.push(...parseListings(payload.html ?? ""));
      if ((payload.event_count ?? 0) < PAGE_SIZE) break;
    }
  } catch {
    sourceAvailable = listings.length > 0;
  }

  const unique = Array.from(new Map(listings.map((item) => [item.id, item])).values())
    .sort((first, second) => Number(first.isClosed) - Number(second.isClosed));

  return {
    items: unique,
    updatedAt: new Date().toISOString(),
    sourceAvailable,
  };
}

export const getStudentCompetitions = unstable_cache(
  fetchStudentCompetitions,
  ["infolomba-student-competitions-v1"],
  { revalidate: 3600, tags: ["student-competitions"] },
);
