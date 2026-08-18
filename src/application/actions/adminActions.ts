"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { di } from "@/lib/di";
import { HeroContent } from "@/domain/entities/HeroContent";
import { VisionMission } from "@/domain/entities/VisionMission";
import { Member } from "@/domain/entities/Member";
import { Document } from "@/domain/entities/Document";
import { RegionalStat } from "@/domain/entities/RegionalStat";
import { AdminDivision, AdminDivisionSlug, getAdminDivisionBySlug } from "@/lib/adminDivisions";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "hmtkba2025";
const DIVISION_PASSWORDS: Record<AdminDivisionSlug, string> = {
  bph: process.env.ADMIN_PASSWORD_BPH || ADMIN_PASSWORD,
  sekretariat: process.env.ADMIN_PASSWORD_SEKRETARIAT || "sekretariat2025",
  akademik: process.env.ADMIN_PASSWORD_AKADEMIK || "akademik2025",
  "minat-bakat": process.env.ADMIN_PASSWORD_MINAT_BAKAT || "minatbakat2025",
  "ekonomi-kreatif": process.env.ADMIN_PASSWORD_EKONOMI_KREATIF || "ekraf2025",
  "komunikasi-publikasi": process.env.ADMIN_PASSWORD_KOMUNIKASI_PUBLIKASI || "kominfo2025",
};

export interface AdminSession {
  divisionSlug: AdminDivisionSlug;
  divisionName: string;
  memberDivision: string;
  canManageAllDivisions: boolean;
}

function toSession(division: AdminDivision): AdminSession {
  return {
    divisionSlug: division.slug,
    divisionName: division.name,
    memberDivision: division.memberDivision,
    canManageAllDivisions: division.canManageAllDivisions,
  };
}

function parseSession(value: string | undefined): AdminSession | null {
  if (!value) return null;

  if (value === "authenticated") {
    const bph = getAdminDivisionBySlug("bph");
    return bph ? toSession(bph) : null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<AdminSession>;
    const division = getAdminDivisionBySlug(parsed.divisionSlug);
    return division ? toSession(division) : null;
  } catch {
    return null;
  }
}

async function verifyAuth(): Promise<AdminSession> {
  const cookieStore = await cookies();
  const session = parseSession(cookieStore.get("admin_session")?.value);
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

  if (password === DIVISION_PASSWORDS[division.slug]) {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", JSON.stringify(toSession(division)), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
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
  return Boolean(parseSession(cookieStore.get("admin_session")?.value));
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
