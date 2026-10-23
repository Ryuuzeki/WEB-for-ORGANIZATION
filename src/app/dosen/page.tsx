import type { Metadata } from "next";
import LecturersPage from "@/presentation/app/dosen/page";

export const metadata: Metadata = {
  title: "Dosen Teknologi Konstruksi Bangunan Air",
  description: "Direktori dosen Program Studi Teknologi Konstruksi Bangunan Air Politeknik Pekerjaan Umum dengan pencarian nama dan NUPTK.",
  alternates: { canonical: "/dosen" },
  openGraph: {
    title: "Dosen Teknologi Konstruksi Bangunan Air | HMTKBA",
    description: "Kenali tim pengajar Program Studi D-III Teknologi Konstruksi Bangunan Air.",
    url: "/dosen",
  },
};

export default LecturersPage;
