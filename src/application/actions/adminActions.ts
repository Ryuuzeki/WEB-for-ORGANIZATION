"use server";

import { cookies } from "next/headers";
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

const SESSION_DURATION_SECONDS = 60 * 60 * 8;
const FALLBACK_SUPERADMIN_PASSWORD_HASH =
  "d8cf06b416bbf480f0d17e439812f578f9916538c69cf82e4c80dd74d06ee557";
const FALLBACK_SESSION_SECRET =
  "10b256aebe1585db74f7fca9b0122866168e698767c83a39390af16109f7fb809e4c9cf4fbc1b8cab7778d8fceb03132";

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
  return secret && secret.length >= 32 ? secret : FALLBACK_SESSION_SECRET;
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
  divisionSlug: AdminDivisionSlug,
  suppliedPassword: string,
  configuredPassword: string | null,
): Promise<boolean> {
  const supplied = new TextEncoder().encode(suppliedPassword);
  if (configuredPassword) {
    return constantTimeEqual(supplied, new TextEncoder().encode(configuredPassword));
  }

  if (divisionSlug !== "superadmin") return false;
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", supplied));
  return constantTimeEqual(digest, Buffer.from(FALLBACK_SUPERADMIN_PASSWORD_HASH, "hex"));
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
  const session = await parseSession(cookieStore.get("admin_session")?.value);
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
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
  const division = getAdminDivisionBySlug(divisionSlug);
  if (!division) {
    return { success: false, error: "Divisi tidak ditemukan!" };
  }

  const expectedPassword = await getDivisionPassword(division.slug);
  if (!expectedPassword && division.slug !== "superadmin") {
    return { success: false, error: "Akses ini belum dikonfigurasi oleh Superadmin." };
  }

  if (await passwordMatches(division.slug, password, expectedPassword)) {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", await createSignedSession(division.slug), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: SESSION_DURATION_SECONDS,
      path: "/",
    });
    return { success: true };
  }
  return { success: false, error: "Password salah!" };
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
}

export async function checkAuthAction(): Promise<boolean> {
  const cookieStore = await cookies();
  return Boolean(await parseSession(cookieStore.get("admin_session")?.value));
}

export async function getAdminSessionAction(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  return parseSession(cookieStore.get("admin_session")?.value);
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

  await saveSiteContent(JSON.parse(serialized) as SiteContent);
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
  const normalized = typeof value === "string" ? value.trim().slice(0, 1000) : "";
  if (!normalized) return "";
  if (normalized.startsWith("/")) return normalized;
  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error();
    return parsed.toString();
  } catch {
    throw new Error(`${fieldName} harus berupa alamat http(s) yang valid.`);
  }
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
    if (!image.type.startsWith("image/")) throw new Error("Berkas foto harus berupa gambar.");
    if (image.size > 4 * 1024 * 1024) throw new Error("Ukuran foto maksimal 4 MB.");
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
    if (!image.type.startsWith("image/")) throw new Error("Berkas poster harus berupa gambar.");
    if (image.size > 4 * 1024 * 1024) throw new Error("Ukuran poster maksimal 4 MB.");
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
  const landingRepo = di.getLandingRepository();
  await landingRepo.updateHeroContent(content);
  revalidatePath("/");
}

// Vision & Mission actions
export async function updateVisionMissionAction(data: VisionMission): Promise<void> {
  await verifyAuth();
  const landingRepo = di.getLandingRepository();
  await landingRepo.updateVisionMission(data);
  revalidatePath("/");
}

// Member actions
export async function saveMemberAction(member: Member): Promise<void> {
  const session = await verifyAuth();
  ensureCanManageMember(session, member);
  const landingRepo = di.getLandingRepository();
  await landingRepo.saveMember(member);
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
  const landingRepo = di.getLandingRepository();
  await landingRepo.saveDocument(document);
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
  const statRepo = di.getRegionalStatRepository();
  await statRepo.saveStat(region, category, stat);
  revalidatePath("/data-center");
}

export async function deleteStatAction(region: string, category: string): Promise<void> {
  await verifyAuth();
  const statRepo = di.getRegionalStatRepository();
  await statRepo.deleteStat(region, category);
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

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${Date.now()}_${crypto.randomUUID()}_${sanitizedName}`;
    const uploaded = await put(`hmtkba/uploads/${filename}`, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type || "application/octet-stream",
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
    if (!file.type.startsWith("image/")) return { success: false, error: "Berkas harus berupa gambar." };
    if (file.size > 6 * 1024 * 1024) return { success: false, error: "Ukuran gambar maksimal 6 MB." };

    const extension = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "jpg";
    const uploaded = await put(`hmtkba/site-media/${Date.now()}-${crypto.randomUUID()}.${extension}`, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
      cacheControlMaxAge: 60 * 60 * 24 * 30,
    });
    return { success: true, url: uploaded.url };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "Gagal mengunggah gambar." };
  }
}
