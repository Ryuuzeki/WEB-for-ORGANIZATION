import type { Metadata } from "next";
import AchievementPage from "@/presentation/app/prestasi/page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ruang Apresiasi Prestasi Mahasiswa",
  description: "Galeri apresiasi prestasi mahasiswa dengan pencarian dan filter kejuaraan individu, kelompok, nasional, dan internasional.",
  alternates: { canonical: "/prestasi" },
  openGraph: {
    title: "Ruang Apresiasi Prestasi Mahasiswa | HMTKBA",
    description: "Rayakan capaian mahasiswa dalam kompetisi akademik dan nonakademik.",
    url: "/prestasi",
  },
};

export default AchievementPage;
