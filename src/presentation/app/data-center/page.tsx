import { di } from "@/lib/di";
import { DataCenterContainer } from "@/presentation/containers/DataCenterContainer";

export const metadata = {
  title: "Data Center - HMTKBA",
  description: "Dashboard klimatologi dan statistik bangunan air nasional.",
};

export default async function DataCenterPage() {
  const getRegionalAnalysis = di.getRegionalAnalysis();

  // Default to Indonesia as a whole or a major region supported by BMKG XML
  const data = await getRegionalAnalysis.execute("Indonesia");

  return (
    <DataCenterContainer
      climate={data.climate}
      stats={data.stats}
    />
  );
}
