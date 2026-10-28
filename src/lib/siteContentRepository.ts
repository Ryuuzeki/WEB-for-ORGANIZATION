import "server-only";

import { get, put } from "@vercel/blob";
import type { SiteContent } from "@/domain/entities/SiteContent";
import seedContent from "@/infrastructure/data/site-content.json";

const SITE_CONTENT_PATH = "hmtkba/data/site-content.json";
const fallbackContent = seedContent as SiteContent;

const cloneFallback = () => JSON.parse(JSON.stringify(fallbackContent)) as SiteContent;
const hasBlobStorage = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

function normalizeFooterDescription(value: string | undefined, fallback: string): string {
  const description = typeof value === "string" && value.trim() ? value.trim() : fallback;
  if (description.includes("\n")) return description;

  const name = "Sekretariat HMTKBA";
  const building = "Gedung UKM Student Centre, Lantai 1";
  if (!description.startsWith(name)) return description;

  const afterName = description.slice(name.length).trim();
  if (!afterName.startsWith(building)) return description;

  const address = afterName.slice(building.length).trim();
  return [name, building, address].filter(Boolean).join("\n");
}

function normalizeSiteContent(value: SiteContent): SiteContent {
  const fallback = cloneFallback();
  const footer = value?.home?.footer;
  const logoMeaning = value?.home?.logoMeaning;
  const program = value?.home?.program;
  const storedLogoItems = Array.isArray(logoMeaning?.items) ? logoMeaning.items : [];

  return {
    ...fallback,
    ...value,
    theme: { ...fallback.theme, ...value?.theme },
    sidebar: { ...fallback.sidebar, ...value?.sidebar },
    pages: {
      ...fallback.pages,
      ...value?.pages,
      organization: {
        ...fallback.pages.organization,
        ...value?.pages?.organization,
      },
      profile: { ...fallback.pages.profile, ...value?.pages?.profile },
      lecturers: { ...fallback.pages.lecturers, ...value?.pages?.lecturers },
      achievements: { ...fallback.pages.achievements, ...value?.pages?.achievements },
      competitions: { ...fallback.pages.competitions, ...value?.pages?.competitions },
      documents: { ...fallback.pages.documents, ...value?.pages?.documents },
      dataCenter: { ...fallback.pages.dataCenter, ...value?.pages?.dataCenter },
    },
    home: {
      ...fallback.home,
      ...value?.home,
      program: {
        ...fallback.home.program,
        ...program,
        items:
          Array.isArray(program?.items) && program.items.length > 0
            ? program.items
            : fallback.home.program.items,
      },
      logoMeaning: {
        ...fallback.home.logoMeaning,
        ...logoMeaning,
        items: fallback.home.logoMeaning.items.map((fallbackItem) => ({
          ...fallbackItem,
          ...storedLogoItems.find((item) => item?.key === fallbackItem.key),
          key: fallbackItem.key,
        })),
      },
      footer: {
        ...fallback.home.footer,
        ...footer,
        description: normalizeFooterDescription(
          footer?.description,
          fallback.home.footer.description,
        ),
        campuses: Array.isArray(footer?.campuses) ? footer.campuses : fallback.home.footer.campuses,
        socialLinks: Array.isArray(footer?.socialLinks) ? footer.socialLinks : fallback.home.footer.socialLinks,
      },
    },
  };
}

export async function getSiteContent(): Promise<SiteContent> {
  if (!hasBlobStorage()) return cloneFallback();

  try {
    const result = await get(SITE_CONTENT_PATH, { access: "public", useCache: false });
    if (!result?.stream) return cloneFallback();
    const parsed = (await new Response(result.stream).json()) as SiteContent;
    return parsed?.theme && parsed?.home ? normalizeSiteContent(parsed) : cloneFallback();
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
