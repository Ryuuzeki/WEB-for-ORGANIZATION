import "server-only";

import { unstable_cache } from "next/cache";
import type {
  CompetitionFeed,
  CompetitionListing,
  CompetitionSourceName,
} from "@/domain/entities/CompetitionListing";

const INFOMBA_ORIGIN = "https://www.infolomba.id";
const INFOMBA_ENDPOINT = `${INFOMBA_ORIGIN}/load-event-2`;
const SILOMBA_ORIGIN = "https://silomba.id";
const SILOMBA_ENDPOINT = "https://api.silomba.id/api/v1/mobile/competitions";
const PAGE_SIZE = 5;
const MAX_PAGES = 6;
const USER_AGENT = "HMTKBA Student Competition Portal/2.0 (+https://hmtkba.vercel.app/portal-lomba)";

interface SourceResult {
  name: CompetitionSourceName;
  items: CompetitionListing[];
  available: boolean;
}

interface SiLombaCompetition {
  id?: number;
  name?: string;
  slug?: string;
  status?: string;
  instagramUsername?: string | null;
  schedule?: {
    registrationStart?: string | null;
    registrationEnd?: string | null;
    deadline?: string | null;
    eventDate?: string | null;
  } | null;
  participantCategories?: Array<{
    ParticipantCategory?: { id?: number; name?: string } | null;
  }>;
  location?: { address?: string | null; platform?: string | null } | null;
  fees?: Array<{ amount?: number | string | null }>;
  competitionPosters?: Array<{ posterURL?: string; order?: number }>;
}

const indonesiaDate = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const rupiah = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });

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
        sourceUrl: id && slug ? `${INFOMBA_ORIGIN}/${slug}-${id}` : `${INFOMBA_ORIGIN}/events?peserta=5`,
        sourceName: "InfoLomba",
        imageUrl: imagePath ? new URL(imagePath, `${INFOMBA_ORIGIN}/`).toString() : "",
        isClosed: /^\s+event-past/.test(segment),
      } satisfies CompetitionListing;
    })
    .filter((item) => item.id && item.title && item.audience.toLowerCase().includes("mahasiswa"));
}

async function fetchInfoLomba(): Promise<SourceResult> {
  const listings: CompetitionListing[] = [];
  let available = false;

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
      const response = await fetch(INFOMBA_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": USER_AGENT,
        },
        body,
        signal: AbortSignal.timeout(12_000),
      });
      if (!response.ok) throw new Error(`InfoLomba merespons ${response.status}`);
      available = true;
      const payload = (await response.json()) as { html?: string; event_count?: number };
      listings.push(...parseListings(payload.html ?? ""));
      if ((payload.event_count ?? 0) < PAGE_SIZE) break;
    }
  } catch {
    available = listings.length > 0;
  }

  return {
    name: "InfoLomba",
    items: Array.from(new Map(listings.map((item) => [item.id, item])).values()),
    available,
  };
}

function dateOnlyInJakarta(date: Date) {
  const parts = new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Jakarta",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function formatSiLombaDate(schedule: SiLombaCompetition["schedule"]) {
  if (!schedule) return "Lihat jadwal di sumber";
  const start = schedule.registrationStart;
  const end = schedule.deadline ?? schedule.registrationEnd ?? schedule.eventDate;
  if (!start && !end) return "Lihat jadwal di sumber";
  if (!start || !end || start.slice(0, 10) === end.slice(0, 10)) {
    return indonesiaDate.format(new Date(end ?? start ?? ""));
  }
  return `${indonesiaDate.format(new Date(start))} – ${indonesiaDate.format(new Date(end))}`;
}

function formatSiLombaFee(fees: SiLombaCompetition["fees"]) {
  const amounts = (fees ?? [])
    .map((fee) => Number(fee.amount))
    .filter((amount) => Number.isFinite(amount) && amount >= 0);
  if (!amounts.length) return "Lihat detail biaya";
  const positives = amounts.filter((amount) => amount > 0);
  if (!positives.length) return "Gratis";
  if (amounts.includes(0)) return `Gratis / mulai Rp${rupiah.format(Math.min(...positives))}`;
  const minimum = Math.min(...positives);
  const maximum = Math.max(...positives);
  return minimum === maximum
    ? `Rp${rupiah.format(minimum)}`
    : `Rp${rupiah.format(minimum)} – Rp${rupiah.format(maximum)}`;
}

function parseSiLombaCompetition(item: SiLombaCompetition): CompetitionListing | null {
  const participantNames = (item.participantCategories ?? [])
    .map((entry) => entry.ParticipantCategory?.name ?? "")
    .filter(Boolean);
  const acceptsStudents = (item.participantCategories ?? []).some(
    (entry) => entry.ParticipantCategory?.id === 1 || entry.ParticipantCategory?.name?.toLowerCase() === "mahasiswa",
  );
  if (!item.id || !item.name || !item.slug || item.status !== "PUBLISHED" || !acceptsStudents) return null;

  const deadline = item.schedule?.deadline ?? item.schedule?.registrationEnd;
  const posters = [...(item.competitionPosters ?? [])].sort((first, second) => (first.order ?? 99) - (second.order ?? 99));
  const location = [item.location?.platform, item.location?.address].filter(Boolean).join(" · ");

  return {
    id: `silomba-${item.id}`,
    title: item.name,
    audience: participantNames.join(", ") || "Mahasiswa",
    fee: formatSiLombaFee(item.fees),
    mode: location || "Lihat lokasi di sumber",
    dateText: formatSiLombaDate(item.schedule),
    organizer: item.instagramUsername ? `@${item.instagramUsername.replace(/^@/, "")}` : "Penyelenggara SiLomba",
    sourceUrl: `${SILOMBA_ORIGIN}/lomba/${item.slug}`,
    sourceName: "SiLomba",
    imageUrl: posters[0]?.posterURL ?? "",
    isClosed: Boolean(deadline && deadline.slice(0, 10) < dateOnlyInJakarta(new Date())),
  };
}

async function fetchSiLomba(): Promise<SourceResult> {
  try {
    const url = new URL(SILOMBA_ENDPOINT);
    url.search = new URLSearchParams({
      page: "1",
      limit: "30",
      participantCategory: "1",
    }).toString();
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) throw new Error(`SiLomba merespons ${response.status}`);
    const payload = (await response.json()) as {
      payload?: { competitions?: SiLombaCompetition[] };
    };
    const items = (payload.payload?.competitions ?? [])
      .map(parseSiLombaCompetition)
      .filter((item): item is CompetitionListing => Boolean(item));
    return { name: "SiLomba", items, available: true };
  } catch {
    return { name: "SiLomba", items: [], available: false };
  }
}

function normalizeTitle(title: string) {
  return title
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

async function fetchStudentCompetitions(): Promise<CompetitionFeed> {
  const results = await Promise.all([fetchSiLomba(), fetchInfoLomba()]);
  const unique = new Map<string, CompetitionListing>();

  for (const result of results) {
    for (const item of result.items) {
      const key = normalizeTitle(item.title);
      const existing = unique.get(key);
      if (!existing || (existing.isClosed && !item.isClosed)) unique.set(key, item);
    }
  }

  const items = [...unique.values()].sort((first, second) => Number(first.isClosed) - Number(second.isClosed));

  return {
    items,
    updatedAt: new Date().toISOString(),
    sourceAvailable: results.some((source) => source.available),
    sources: results.map((source) => ({
      name: source.name,
      available: source.available,
      itemCount: source.items.length,
    })),
  };
}

export const getStudentCompetitions = unstable_cache(
  fetchStudentCompetitions,
  ["student-competitions-multi-source-v2"],
  { revalidate: 3600, tags: ["student-competitions"] },
);
