import { di } from "@/lib/di";
import { getSiteContent } from "@/lib/siteContentRepository";
import { DataCenterContainer } from "@/presentation/containers/DataCenterContainer";

export const metadata = {
  title: "Data Center Keairan",
  description: "Pantau ringkasan klimatologi BMKG dan statistik infrastruktur air Indonesia untuk pembelajaran mahasiswa konstruksi bangunan air.",
  alternates: { canonical: "/data-center" },
  openGraph: {
    title: "Data Center Keairan HMTKBA",
    description: "Ringkasan klimatologi dan statistik infrastruktur air Indonesia.",
    url: "/data-center",
  },
};

export default async function DataCenterPage() {
  const getRegionalAnalysis = di.getRegionalAnalysis();

  // Default to Indonesia as a whole or a major region supported by BMKG XML
  const [data, siteContent] = await Promise.all([
    getRegionalAnalysis.execute("Indonesia"),
    getSiteContent(),
  ]);

  return (
    <DataCenterContainer
      climate={data.climate}
      stats={data.stats}
      content={siteContent.pages.dataCenter}
    />
  );
}
