export type AdminDivisionSlug =
  | "superadmin"
  | "bph"
  | "sekretariat"
  | "akademik"
  | "minat-bakat"
  | "ekonomi-kreatif"
  | "komunikasi-publikasi";

export interface AdminDivision {
  slug: AdminDivisionSlug;
  name: string;
  shortName: string;
  memberDivision: string;
  canManageAllDivisions: boolean;
  isSuperAdmin: boolean;
}

export const ADMIN_DIVISIONS: AdminDivision[] = [
  {
    slug: "superadmin",
    name: "Superadmin",
    shortName: "Superadmin",
    memberDivision: "Semua Divisi",
    canManageAllDivisions: true,
    isSuperAdmin: true,
  },
  {
    slug: "bph",
    name: "BPH (Badan Pengurus Harian)",
    shortName: "BPH",
    memberDivision: "BPH (Badan Pengurus Harian)",
    canManageAllDivisions: true,
    isSuperAdmin: false,
  },
  {
    slug: "sekretariat",
    name: "Sekretariat Kabinet",
    shortName: "Sekretariat",
    memberDivision: "Sekretariat Kabinet",
    canManageAllDivisions: false,
    isSuperAdmin: false,
  },
  {
    slug: "akademik",
    name: "Akademik Mahasiswa",
    shortName: "Akademik",
    memberDivision: "Akademik Mahasiswa",
    canManageAllDivisions: false,
    isSuperAdmin: false,
  },
  {
    slug: "minat-bakat",
    name: "Minat dan Bakat",
    shortName: "Minat Bakat",
    memberDivision: "Minat dan Bakat",
    canManageAllDivisions: false,
    isSuperAdmin: false,
  },
  {
    slug: "ekonomi-kreatif",
    name: "Ekonomi Kreatif",
    shortName: "Ekraf",
    memberDivision: "Ekonomi Kreatif",
    canManageAllDivisions: false,
    isSuperAdmin: false,
  },
  {
    slug: "komunikasi-publikasi",
    name: "Komunikasi dan Publikasi",
    shortName: "Kominfo",
    memberDivision: "Komunikasi dan Publikasi",
    canManageAllDivisions: false,
    isSuperAdmin: false,
  },
];

export function getAdminDivisionBySlug(slug: string | undefined): AdminDivision | undefined {
  return ADMIN_DIVISIONS.find((division) => division.slug === slug);
}
