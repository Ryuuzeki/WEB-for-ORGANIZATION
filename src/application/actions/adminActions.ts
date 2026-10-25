"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath, updateTag } from "next/cache";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { put } from "@vercel/blob";
import { di } from "@/lib/di";
import { HeroContent } from "@/domain/entities/HeroContent";
import { VisionMission } from "@/domain/entities/VisionMission";
import { Member } from "@/domain/entities/Member";
import { Document } from "@/domain/entities/Document";
import { RegionalStat } from "@/domain/entities/RegionalStat";
import { CalendarEvent, CalendarEventInput } from "@/domain/entities/CalendarEvent";
import { NewsItem } from "@/domain/entities/NewsItem";
import { ManualCompetition } from "@/domain/entities/ManualCompetition";
import { SiteContent } from "@/domain/entities/SiteContent";
import { AdminDivision, AdminDivisionSlug, getAdminDivisionBySlug } from "@/lib/adminDivisions";
import {
  listCalendarEvents,
  removeCalendarEvent,
  upsertCalendarEvent,
} from "@/lib/calendarEvents";
import {
  deleteNewsImage,
  listNewsItems,
  saveNewsItems,
  uploadNewsImage,
} from "@/lib/newsRepository";
import { getSiteContent, saveSiteContent } from "@/lib/siteContentRepository";
import {
  deleteManualCompetitionImage,
  listManualCompetitions,
  saveManualCompetitions,
  uploadManualCompetitionImage,
} from "@/lib/manualCompetitionRepository";
import { validateImageFile } from "@/lib/uploadSecurity";

const SESSION_DURATION_SECONDS = 60 * 60 * 8;
const SESSION_COOKIE_NAME = process.env.NODE_ENV === "production"
  ? "__Host-hmtkba_admin_session"
  : "hmtkba_admin_session";
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_LOCK_MS = 15 * 60 * 1000;
const MAX_LOGIN_FAILURES = 5;

interface LoginAttempt {
  failures: number;
  windowStartedAt: number;
  lockedUntil: number;
}

type LoginAttemptGlobals = typeof globalThis & {
  __hmtkbaLoginAttempts?: Map<string, LoginAttempt>;
};

const loginAttempts = ((globalThis as LoginAttemptGlobals).__hmtkbaLoginAttempts ??= new Map());

export interface AdminSession {
  divisionSlug: AdminDivisionSlug;
  divisionName: string;
  memberDivision: string;
  canManageAllDivisions: boolean;
  isSuperAdmin: boolean;
}

interface SignedSessionPayload {
  divisionSlug: AdminDivisionSlug;
  expiresAt: number;
}

function toSession(division: AdminDivision): AdminSession {
  return {
    divisionSlug: division.slug,
    divisionName: division.name,
    memberDivision: division.memberDivision,
    canManageAllDivisions: division.canManageAllDivisions,
    isSuperAdmin: division.isSuperAdmin,
  };
}

async function getRuntimeSecret(key: string): Promise<string | null> {
  const processValue = process.env[key];
  if (processValue) return processValue;

  try {
    const { env } = await getCloudflareContext({ async: true });
    const value = (env as unknown as Record<string, unknown>)[key];
    return typeof value === "string" && value ? value : null;
  } catch {
    return null;
  }
}

async function getSessionSecret(): Promise<string | null> {
  const secret = await getRuntimeSecret("ADMIN_SESSION_SECRET");
  return secret && secret.length >= 32 ? secret : null;
}

function constantTimeEqual(first: Uint8Array, second: Uint8Array): boolean {
  let difference = first.length ^ second.length;
  const comparisonLength = Math.max(first.length, second.length);
  for (let index = 0; index < comparisonLength; index += 1) {
    difference |= (first[index] ?? 0) ^ (second[index] ?? 0);
  }
  return difference === 0;
}

async function passwordMatches(
  suppliedPassword: string,
  configuredPassword: string | null,
): Promise<boolean> {
  if (!configuredPassword) return false;
  return constantTimeEqual(
    new TextEncoder().encode(suppliedPassword),
    new TextEncoder().encode(configuredPassword),
  );
}

async function getDivisionPassword(divisionSlug: AdminDivisionSlug): Promise<string | null> {
  const keys: Record<AdminDivisionSlug, string> = {
    superadmin: "SUPERADMIN_PASSWORD",
    bph: "ADMIN_PASSWORD_BPH",
    sekretariat: "ADMIN_PASSWORD_SEKRETARIAT",
    akademik: "ADMIN_PASSWORD_AKADEMIK",
    "minat-bakat": "ADMIN_PASSWORD_MINAT_BAKAT",
    "ekonomi-kreatif": "ADMIN_PASSWORD_EKONOMI_KREATIF",
    "komunikasi-publikasi": "ADMIN_PASSWORD_KOMUNIKASI_PUBLIKASI",
  };
  const password = await getRuntimeSecret(keys[divisionSlug]);
  if (password || divisionSlug !== "bph") return password;
  return getRuntimeSecret("ADMIN_PASSWORD");
}

function encodeBase64Url(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

async function importSessionKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function createSignedSession(divisionSlug: AdminDivisionSlug): Promise<string> {
  const secret = await getSessionSecret();
  if (!secret) throw new Error("Konfigurasi keamanan admin belum lengkap.");
  const payload = encodeBase64Url(JSON.stringify({
    divisionSlug,
    expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000,
  } satisfies SignedSessionPayload));
  const key = await importSessionKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return `${payload}.${Buffer.from(signature).toString("base64url")}`;
}

async function parseSession(value: string | undefined): Promise<AdminSession | null> {
  const secret = await getSessionSecret();
  if (!value || !secret) return null;
  try {
    const [payload, signature] = value.split(".");
    if (!payload || !signature) return null;
    const key = await importSessionKey(secret);
    const verified = await crypto.subtle.verify(
      "HMAC",
      key,
      Buffer.from(signature, "base64url"),
      new TextEncoder().encode(payload),
    );
    if (!verified) return null;

    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SignedSessionPayload;
    if (!parsed.expiresAt || parsed.expiresAt <= Date.now()) return null;
    const division = getAdminDivisionBySlug(parsed.divisionSlug);
    return division ? toSession(division) : null;
  } catch {
    return null;
  }
}

async function verifyAuth(): Promise<AdminSession> {
  const cookieStore = await cookies();
  const session = await parseSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

async function getLoginAttemptKey(divisionSlug: string): Promise<string> {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || requestHeaders.get("x-real-ip") || "unknown";
  return `${address}:${divisionSlug}`;
}

function pruneLoginAttempts(now: number): void {
  if (loginAttempts.size < 1_000) return;
  for (const [key, attempt] of loginAttempts) {
    if (attempt.lockedUntil <= now && now - attempt.windowStartedAt > LOGIN_WINDOW_MS) {
      loginAttempts.delete(key);
    }
  }
}

function secondsUntilLoginAllowed(key: string, now: number): number {
  const attempt = loginAttempts.get(key);
  if (!attempt || attempt.lockedUntil <= now) return 0;
  return Math.ceil((attempt.lockedUntil - now) / 1000);
}

function recordLoginFailure(key: string, now: number): void {
  const existing = loginAttempts.get(key);
  const current = !existing || now - existing.windowStartedAt > LOGIN_WINDOW_MS
    ? { failures: 0, windowStartedAt: now, lockedUntil: 0 }
    : existing;
  current.failures += 1;
  if (current.failures >= MAX_LOGIN_FAILURES) current.lockedUntil = now + LOGIN_LOCK_MS;
  loginAttempts.set(key, current);
}

function ensureCanManageMember(session: AdminSession, member?: Member) {
  if (!member || session.canManageAllDivisions) return;
  if (member.division !== session.memberDivision) {
    throw new Error("Akun divisi ini hanya dapat mengelola anggota dari divisinya sendiri.");
  }
}

function ensureSuperAdmin(session: AdminSession): void {
  if (!session.isSuperAdmin) {
    throw new Error("Hanya Superadmin yang dapat mengelola bagian ini.");
  }
}

function cleanEventText(value: string | undefined, maximumLength: number): string {
  return (value ?? "").trim().slice(0, maximumLength);
}

function normalizeStoredUrl(
  value: unknown,
  fieldName: string,
  options: { allowRelative?: boolean; required?: boolean } = {},
): string {
  const normalized = typeof value === "string" ? value.trim().slice(0, 1_000) : "";
  if (!normalized) {
    if (options.required) throw new Error(`${fieldName} wajib diisi.`);
    return "";
  }

  if (options.allowRelative && normalized.startsWith("/") && !normalized.startsWith("//")) {
    return normalized;
  }

  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && parsed.protocol === "http:")) {
      throw new Error();
    }
    parsed.username = "";
    parsed.password = "";
    return parsed.toString();
  } catch {
    throw new Error(`${fieldName} harus berupa alamat HTTPS yang valid.`);
  }
}

function normalizeSafeId(value: unknown, fieldName: string): string {
  const normalized = cleanEventText(typeof value === "string" ? value : "", 80);
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(normalized)) {
    throw new Error(`${fieldName} tidak valid.`);
  }
  return normalized;
}

function normalizeEventInput(input: CalendarEventInput): CalendarEvent {
  const title = cleanEventText(input.title, 120);
  const description = cleanEventText(input.description, 800);
  const location = cleanEventText(input.location, 160);
  const startsAt = new Date(input.startsAt);
  const endsAt = input.endsAt ? new Date(input.endsAt) : null;

  if (!title) throw new Error("Nama kegiatan wajib diisi.");
  if (Number.isNaN(startsAt.getTime())) throw new Error("Tanggal dan waktu mulai tidak valid.");
  if (endsAt && Number.isNaN(endsAt.getTime())) throw new Error("Waktu selesai tidak valid.");
  if (endsAt && endsAt.getTime() < startsAt.getTime()) {
    throw new Error("Waktu selesai tidak boleh lebih awal dari waktu mulai.");
  }

  const now = new Date().toISOString();
  return {
    id: cleanEventText(input.id, 80) || crypto.randomUUID(),
    title,
    description,
    location,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt?.toISOString() ?? null,
    createdAt: now,
    updatedAt: now,
  };
}

export async function loginAction(
  divisionSlug: AdminDivisionSlug,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const now = Date.now();
  pruneLoginAttempts(now);
  const attemptKey = await getLoginAttemptKey(String(divisionSlug));
  const retryAfter = secondsUntilLoginAllowed(attemptKey, now);
  if (retryAfter > 0) {
    return {
      success: false,
      error: `Terlalu banyak percobaan masuk. Coba lagi dalam ${Math.ceil(retryAfter / 60)} menit.`,
    };
  }

  const division = getAdminDivisionBySlug(divisionSlug);
  if (!division) {
    recordLoginFailure(attemptKey, now);
    return { success: false, error: "Kredensial tidak valid." };
  }

  const expectedPassword = await getDivisionPassword(division.slug);
  const sessionSecret = await getSessionSecret();
  if (!expectedPassword || !sessionSecret) {
    return { success: false, error: "Konfigurasi keamanan admin belum lengkap." };
  }

  if (await passwordMatches(password.slice(0, 256), expectedPassword)) {
    loginAttempts.delete(attemptKey);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, await createSignedSession(division.slug), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: SESSION_DURATION_SECONDS,
      path: "/",
      priority: "high",
    });
    return { success: true };
  }
  recordLoginFailure(attemptKey, now);
  return { success: false, error: "Kredensial tidak valid." };
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function checkAuthAction(): Promise<boolean> {
  const cookieStore = await cookies();
  return Boolean(await parseSession(cookieStore.get(SESSION_COOKIE_NAME)?.value));
}

export async function getAdminSessionAction(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  return parseSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export async function getSiteContentAction(): Promise<SiteContent> {
  return getSiteContent();
}

export async function saveSiteContentAction(content: SiteContent): Promise<void> {
  const session = await verifyAuth();
  ensureSuperAdmin(session);

  const serialized = JSON.stringify(content);
  if (serialized.length > 120_000) throw new Error("Konten website terlalu besar.");
  const themeValues = Object.values(content.theme ?? {});
  if (themeValues.length !== 7 || themeValues.some((value) => !/^#[0-9a-fA-F]{6}$/.test(value))) {
    throw new Error("Warna tema harus memakai format heksadesimal, misalnya #102a6b.");
  }
  if (!content.home?.about?.title || !content.home?.program?.title || !content.home?.footer?.brandTitle) {
    throw new Error("Judul pada setiap bagian utama tidak boleh kosong.");
  }

  const sanitized = JSON.parse(serialized) as SiteContent;
  const campuses = sanitized.home.footer.campuses;
  const socialLinks = sanitized.home.footer.socialLinks;
  if (!Array.isArray(campuses) || campuses.length > 6) throw new Error("Data lokasi tidak valid.");
  if (!Array.isArray(socialLinks) || socialLinks.length > 5) throw new Error("Data media sosial tidak valid.");
  const allowedPlatforms = new Set(["instagram", "youtube", "tiktok", "facebook", "threads"]);
  sanitized.home.footer.campuses = campuses.map((campus) => ({
    name: cleanEventText(campus?.name, 80),
    address: cleanEventText(campus?.address, 300),
    mapUrl: normalizeStoredUrl(campus?.mapUrl, "Tautan lokasi", { allowRelative: true }),
  }));
  sanitized.home.footer.socialLinks = socialLinks.map((social) => {
    if (!allowedPlatforms.has(social?.platform)) throw new Error("Jenis media sosial tidak valid.");
    return {
      platform: social.platform,
      label: cleanEventText(social.label, 80),
      url: normalizeStoredUrl(social.url, `Tautan ${social.label || "media sosial"}`, { allowRelative: true }),
    };
  });
  sanitized.home.footer.phone = cleanEventText(sanitized.home.footer.phone, 40);
  sanitized.home.footer.email = cleanEventText(sanitized.home.footer.email, 254);
  if (sanitized.home.footer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized.home.footer.email)) {
    throw new Error("Alamat email footer tidak valid.");
  }

  await saveSiteContent(sanitized);
  revalidatePath("/", "layout");
  revalidatePath("/admin");
}

// Public calendar reads and Superadmin-only calendar management
export async function getCalendarEventsAction(): Promise<CalendarEvent[]> {
  return listCalendarEvents();
}

export async function saveCalendarEventAction(input: CalendarEventInput): Promise<CalendarEvent> {
  const session = await verifyAuth();
  ensureSuperAdmin(session);

  const event = normalizeEventInput(input);
  if (input.id) {
    const existing = (await listCalendarEvents()).find((item) => item.id === event.id);
    if (existing) event.createdAt = existing.createdAt;
  }

  await upsertCalendarEvent(event);
  revalidatePath("/");
  revalidatePath("/admin");
  return event;
}

export async function deleteCalendarEventAction(id: string): Promise<void> {
  const session = await verifyAuth();
  ensureSuperAdmin(session);
  const normalizedId = cleanEventText(id, 80);
  if (!normalizedId) throw new Error("Kegiatan tidak ditemukan.");

  await removeCalendarEvent(normalizedId);
  revalidatePath("/");
  revalidatePath("/admin");
}

function normalizeOptionalUrl(value: FormDataEntryValue | null, fieldName: string): string {
  return normalizeStoredUrl(value, fieldName, { allowRelative: true });
}

function parseNewsDate(value: FormDataEntryValue | null): string {
  const date = new Date(typeof value === "string" ? value : "");
  if (Number.isNaN(date.getTime())) throw new Error("Tanggal publikasi tidak valid.");
  return date.toISOString();
}

// Public news reads and Superadmin-only news management
export async function getNewsItemsAction(): Promise<NewsItem[]> {
  return listNewsItems();
}

export async function saveNewsItemAction(formData: FormData): Promise<NewsItem> {
  const session = await verifyAuth();
  ensureSuperAdmin(session);

  const id = cleanEventText(String(formData.get("id") ?? ""), 80) || crypto.randomUUID();
  const title = cleanEventText(String(formData.get("title") ?? ""), 160);
  const category = cleanEventText(String(formData.get("category") ?? ""), 60);
  const summary = cleanEventText(String(formData.get("summary") ?? ""), 1000);
  const publishedAt = parseNewsDate(formData.get("publishedAt"));
  const orderValue = Number.parseInt(String(formData.get("order") ?? "0"), 10);
  const isPublished = formData.get("isPublished") === "true";

  if (!title) throw new Error("Judul berita wajib diisi.");
  if (!category) throw new Error("Kategori berita wajib diisi.");
  if (!summary) throw new Error("Ringkasan berita wajib diisi.");

  const currentItems = await listNewsItems();
  const existing = currentItems.find((item) => item.id === id);
  let imageUrl = normalizeOptionalUrl(formData.get("imageUrl"), "URL gambar");
  const linkUrl = normalizeOptionalUrl(formData.get("linkUrl"), "Tautan berita");
  const image = formData.get("image");

  if (image instanceof File && image.size > 0) {
    await validateImageFile(image, 4 * 1024 * 1024);
    imageUrl = await uploadNewsImage(image);
  }
  if (!imageUrl) imageUrl = existing?.imageUrl || "/LOGO HIMA.png";

  const now = new Date().toISOString();
  const newsItem: NewsItem = {
    id,
    title,
    category,
    summary,
    imageUrl,
    linkUrl,
    publishedAt,
    isPublished,
    order: Number.isFinite(orderValue) ? Math.max(0, Math.min(orderValue, 999)) : 0,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await saveNewsItems([...currentItems.filter((item) => item.id !== id), newsItem]);
  if (existing?.imageUrl && existing.imageUrl !== imageUrl) await deleteNewsImage(existing.imageUrl);
  revalidatePath("/");
  revalidatePath("/admin");
  return newsItem;
}

export async function setNewsPublishedAction(id: string, isPublished: boolean): Promise<NewsItem> {
  const session = await verifyAuth();
  ensureSuperAdmin(session);
  const items = await listNewsItems();
  const existing = items.find((item) => item.id === id);
  if (!existing) throw new Error("Berita tidak ditemukan.");
  const updated = { ...existing, isPublished, updatedAt: new Date().toISOString() };
  await saveNewsItems([...items.filter((item) => item.id !== id), updated]);
  revalidatePath("/");
  revalidatePath("/admin");
  return updated;
}

export async function deleteNewsItemAction(id: string): Promise<void> {
  const session = await verifyAuth();
  ensureSuperAdmin(session);
  const normalizedId = cleanEventText(id, 80);
  const items = await listNewsItems();
  const existing = items.find((item) => item.id === normalizedId);
  if (!existing) throw new Error("Berita tidak ditemukan.");
  await saveNewsItems(items.filter((item) => item.id !== normalizedId));
  await deleteNewsImage(existing.imageUrl);
  revalidatePath("/");
  revalidatePath("/admin");
}

function parseOptionalCompetitionDate(value: FormDataEntryValue | null, fieldName: string): string {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) return "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized) || Number.isNaN(new Date(`${normalized}T00:00:00Z`).getTime())) {
    throw new Error(`${fieldName} tidak valid.`);
  }
  return normalized;
}

// Superadmin-only manual competition management
export async function saveManualCompetitionAction(formData: FormData): Promise<ManualCompetition> {
  const session = await verifyAuth();
  ensureSuperAdmin(session);

  const id = cleanEventText(String(formData.get("id") ?? ""), 80) || crypto.randomUUID();
  const title = cleanEventText(String(formData.get("title") ?? ""), 180);
  const audience = cleanEventText(String(formData.get("audience") ?? ""), 120) || "Mahasiswa";
  const fee = cleanEventText(String(formData.get("fee") ?? ""), 120) || "Lihat detail biaya";
  const mode = cleanEventText(String(formData.get("mode") ?? ""), 160) || "Lihat lokasi di sumber";
  const organizer = cleanEventText(String(formData.get("organizer") ?? ""), 160) || "HMTKBA";
  const registrationStart = parseOptionalCompetitionDate(formData.get("registrationStart"), "Tanggal mulai");
  const registrationEnd = parseOptionalCompetitionDate(formData.get("registrationEnd"), "Batas pendaftaran");
  const isPublished = formData.get("isPublished") === "true";

  if (!title) throw new Error("Nama lomba wajib diisi.");
  if (registrationStart && registrationEnd && registrationEnd < registrationStart) {
    throw new Error("Batas pendaftaran tidak boleh lebih awal dari tanggal mulai.");
  }

  const currentItems = await listManualCompetitions();
  const existing = currentItems.find((item) => item.id === id);
  let imageUrl = normalizeOptionalUrl(formData.get("imageUrl"), "URL poster");
  const sourceUrl = normalizeOptionalUrl(formData.get("sourceUrl"), "Tautan detail");
  const image = formData.get("image");

  if (image instanceof File && image.size > 0) {
    await validateImageFile(image, 4 * 1024 * 1024);
    imageUrl = await uploadManualCompetitionImage(image);
  }
  if (!imageUrl) imageUrl = existing?.imageUrl || "/LOGO HIMA.png";

  const now = new Date().toISOString();
  const item: ManualCompetition = {
    id,
    title,
    audience,
    fee,
    mode,
    organizer,
    sourceUrl,
    imageUrl,
    registrationStart,
    registrationEnd,
    isPublished,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await saveManualCompetitions([...currentItems.filter((competition) => competition.id !== id), item]);
  if (existing?.imageUrl && existing.imageUrl !== imageUrl) await deleteManualCompetitionImage(existing.imageUrl);
  updateTag("student-competitions");
  revalidatePath("/portal-lomba");
  revalidatePath("/admin");
  return item;
}

export async function setManualCompetitionPublishedAction(
  id: string,
  isPublished: boolean,
): Promise<ManualCompetition> {
  const session = await verifyAuth();
  ensureSuperAdmin(session);
  const items = await listManualCompetitions();
  const existing = items.find((item) => item.id === id);
  if (!existing) throw new Error("Lomba manual tidak ditemukan.");
  const updated = { ...existing, isPublished, updatedAt: new Date().toISOString() };
  await saveManualCompetitions([...items.filter((item) => item.id !== id), updated]);
  updateTag("student-competitions");
  revalidatePath("/portal-lomba");
  revalidatePath("/admin");
  return updated;
}

export async function deleteManualCompetitionAction(id: string): Promise<void> {
  const session = await verifyAuth();
  ensureSuperAdmin(session);
  const normalizedId = cleanEventText(id, 80);
  const items = await listManualCompetitions();
  const existing = items.find((item) => item.id === normalizedId);
  if (!existing) throw new Error("Lomba manual tidak ditemukan.");
  await saveManualCompetitions(items.filter((item) => item.id !== normalizedId));
  await deleteManualCompetitionImage(existing.imageUrl);
  updateTag("student-competitions");
  revalidatePath("/portal-lomba");
  revalidatePath("/admin");
}

// Hero actions
export async function updateHeroAction(content: HeroContent): Promise<void> {
  await verifyAuth();
  const sanitized: HeroContent = {
    title: cleanEventText(content.title, 180),
    subtitle: cleanEventText(content.subtitle, 600),
    ctaText: cleanEventText(content.ctaText, 80),
    eyebrow: cleanEventText(content.eyebrow, 80),
    secondaryCtaText: cleanEventText(content.secondaryCtaText, 80),
    backgroundImageUrl: normalizeStoredUrl(content.backgroundImageUrl, "URL gambar hero", { allowRelative: true }),
    stats: Array.isArray(content.stats)
      ? content.stats.slice(0, 6).map((stat) => ({
          value: cleanEventText(stat?.value, 30),
          label: cleanEventText(stat?.label, 80),
        }))
      : [],
  };
  if (!sanitized.title || !sanitized.subtitle || !sanitized.ctaText) throw new Error("Konten hero belum lengkap.");
  const landingRepo = di.getLandingRepository();
  await landingRepo.updateHeroContent(sanitized);
  revalidatePath("/");
}

// Vision & Mission actions
export async function updateVisionMissionAction(data: VisionMission): Promise<void> {
  await verifyAuth();
  const sanitized: VisionMission = {
    vision: cleanEventText(data.vision, 1_500),
    mission: Array.isArray(data.mission) ? data.mission.slice(0, 20).map((item) => cleanEventText(item, 600)).filter(Boolean) : [],
    visionTitle: cleanEventText(data.visionTitle, 80),
    missionTitle: cleanEventText(data.missionTitle, 80),
  };
  if (!sanitized.vision || sanitized.mission.length === 0) throw new Error("Visi dan misi wajib diisi.");
  const landingRepo = di.getLandingRepository();
  await landingRepo.updateVisionMission(sanitized);
  revalidatePath("/");
}

// Member actions
export async function saveMemberAction(member: Member): Promise<void> {
  const session = await verifyAuth();
  const sanitized: Member = {
    id: normalizeSafeId(member.id, "ID anggota"),
    name: cleanEventText(member.name, 120),
    role: cleanEventText(member.role, 120),
    division: cleanEventText(member.division, 120),
    imageUrl: normalizeStoredUrl(member.imageUrl, "URL foto anggota", { allowRelative: true }),
    period: cleanEventText(member.period, 40),
  };
  if (!sanitized.name || !sanitized.role || !sanitized.division || !sanitized.period) {
    throw new Error("Data anggota belum lengkap.");
  }
  const existingMembers = await di.getOrganizationStructure().execute();
  ensureCanManageMember(session, existingMembers.find((item) => item.id === sanitized.id));
  ensureCanManageMember(session, sanitized);
  const landingRepo = di.getLandingRepository();
  await landingRepo.saveMember(sanitized);
  revalidatePath("/struktur-organisasi");
  revalidatePath("/");
}

export async function deleteMemberAction(id: string): Promise<void> {
  const session = await verifyAuth();
  if (!session.canManageAllDivisions) {
    const members = await di.getOrganizationStructure().execute();
    ensureCanManageMember(session, members.find((member) => member.id === id));
  }
  const landingRepo = di.getLandingRepository();
  await landingRepo.deleteMember(id);
  revalidatePath("/struktur-organisasi");
  revalidatePath("/");
}

// Document actions
export async function saveDocumentAction(document: Document): Promise<void> {
  await verifyAuth();
  const sanitized: Document = {
    id: normalizeSafeId(document.id, "ID dokumen"),
    title: cleanEventText(document.title, 180),
    category: cleanEventText(document.category, 80),
    downloadUrl: normalizeStoredUrl(document.downloadUrl, "Tautan dokumen", { allowRelative: true, required: true }),
  };
  if (!sanitized.title || !sanitized.category) throw new Error("Data dokumen belum lengkap.");
  const landingRepo = di.getLandingRepository();
  await landingRepo.saveDocument(sanitized);
  revalidatePath("/");
}

export async function deleteDocumentAction(id: string): Promise<void> {
  await verifyAuth();
  const landingRepo = di.getLandingRepository();
  await landingRepo.deleteDocument(id);
  revalidatePath("/");
}

// Regional Stat actions
export async function saveStatAction(region: string, category: string, stat: RegionalStat): Promise<void> {
  await verifyAuth();
  const safeRegion = cleanEventText(region, 80);
  const safeCategory = cleanEventText(category, 100);
  if (!safeRegion || !safeCategory || ["__proto__", "prototype", "constructor"].includes(safeRegion.toLowerCase())) {
    throw new Error("Wilayah atau kategori tidak valid.");
  }
  const sanitized: RegionalStat = {
    category: cleanEventText(stat.category, 100),
    value: cleanEventText(stat.value, 40),
    unit: cleanEventText(stat.unit, 60),
    year: cleanEventText(stat.year, 10),
    description: cleanEventText(stat.description, 500),
  };
  if (!sanitized.category || !sanitized.value || !sanitized.year) throw new Error("Data statistik belum lengkap.");
  const statRepo = di.getRegionalStatRepository();
  await statRepo.saveStat(safeRegion, safeCategory, sanitized);
  revalidatePath("/data-center");
}

export async function deleteStatAction(region: string, category: string): Promise<void> {
  await verifyAuth();
  const safeRegion = cleanEventText(region, 80);
  const safeCategory = cleanEventText(category, 100);
  if (!safeRegion || !safeCategory || ["__proto__", "prototype", "constructor"].includes(safeRegion.toLowerCase())) {
    throw new Error("Wilayah atau kategori tidak valid.");
  }
  const statRepo = di.getRegionalStatRepository();
  await statRepo.deleteStat(safeRegion, safeCategory);
  revalidatePath("/data-center");
}

// File Upload Action
export async function uploadFileAction(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    await verifyAuth();
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "Tidak ada berkas yang diunggah" };
    }

    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: "Ukuran berkas maksimal 10 MB" };
    }

    const imageMetadata = await validateImageFile(file, 6 * 1024 * 1024);

    const filename = `${Date.now()}_${crypto.randomUUID()}.${imageMetadata.extension}`;
    const uploaded = await put(`hmtkba/uploads/${filename}`, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: imageMetadata.contentType,
      cacheControlMaxAge: 60 * 60 * 24 * 30,
    });
    return { success: true, url: uploaded.url };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal mengunggah berkas";
    return { success: false, error: message };
  }
}

export async function uploadSiteAssetAction(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const session = await verifyAuth();
    ensureSuperAdmin(session);
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) return { success: false, error: "Pilih foto terlebih dahulu." };
    const imageMetadata = await validateImageFile(file, 6 * 1024 * 1024);

    const uploaded = await put(`hmtkba/site-media/${Date.now()}-${crypto.randomUUID()}.${imageMetadata.extension}`, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: imageMetadata.contentType,
      cacheControlMaxAge: 60 * 60 * 24 * 30,
    });
    return { success: true, url: uploaded.url };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Gagal mengunggah gambar." };
  }
}
