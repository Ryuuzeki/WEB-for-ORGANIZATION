import { di } from "@/lib/di";
import { OrganizationContainer } from "@/presentation/containers/OrganizationContainer";

export const metadata = {
  title: "Struktur Organisasi",
  description: "Kenali susunan pengurus, divisi, dan peran anggota HMTKBA periode 2024/2025.",
  alternates: { canonical: "/struktur-organisasi" },
  openGraph: {
    title: "Struktur Organisasi HMTKBA 2024/2025",
    description: "Susunan pengurus dan divisi HMTKBA periode 2024/2025.",
    url: "/struktur-organisasi",
  },
};

export default async function StrukturOrganisasiPage() {
  const getOrganizationStructure = di.getOrganizationStructure();
  const members = await getOrganizationStructure.execute();

  return <OrganizationContainer members={members} />;
}
