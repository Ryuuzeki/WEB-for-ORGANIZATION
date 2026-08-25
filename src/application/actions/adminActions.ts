"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { di } from "@/lib/di";
import { HeroContent } from "@/domain/entities/HeroContent";
import { VisionMission } from "@/domain/entities/VisionMission";
import { Member } from "@/domain/entities/Member";
import { Document } from "@/domain/entities/Document";
import { RegionalStat } from "@/domain/entities/RegionalStat";
import { AdminDivision, AdminDivisionSlug, getAdminDivisionBySlug } from "@/lib/adminDivisions";

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize and generate unique name
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}_${sanitizedName}`;

    // Path to public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;
    return { success: true, url: fileUrl };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal mengunggah berkas";
    return { success: false, error: message };
  }
}
