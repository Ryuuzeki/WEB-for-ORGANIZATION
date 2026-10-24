import type { Metadata } from "next";
import StudentCompetitionPage from "@/presentation/app/portal-lomba/page";

export const metadata: Metadata = {
  title: "Portal Lomba Mahasiswa",
  description: "Temukan informasi lomba terbaru yang menerima peserta mahasiswa, diperbarui berkala dari InfoLomba.id dan SiLomba.id.",
  alternates: { canonical: "/portal-lomba" },
  openGraph: {
    title: "Portal Lomba Mahasiswa | HMTKBA",
    description: "Daftar lomba mahasiswa terkini dengan pencarian, filter, jadwal, biaya, dan tautan sumber resmi.",
    url: "/portal-lomba",
  },
};

export default StudentCompetitionPage;
