import { di } from "@/lib/di";
import { HeroContainer } from "../containers/HeroContainer";
import { VisionMissionContainer } from "../containers/VisionMissionContainer";
import { AIAssistantTeaserContainer } from "../containers/AIAssistantTeaserContainer";
import { ServicesContainer } from "../containers/ServicesContainer";
import { OrganizationContainer } from "../containers/OrganizationContainer";

export default async function Home() {
  // UI layer now depends on lib/di instead of infrastructure
  const getLandingPageData = di.getLandingPageData();

  const data = await getLandingPageData.execute();

  return (
    <div className="pt-20">
      <HeroContainer content={data.hero} />

      <div id="about">
        <AIAssistantTeaserContainer />
      </div>

      <div id="vision">
        <VisionMissionContainer data={data.visionMission} />
      </div>

      <div id="docs">
        <ServicesContainer documents={data.documents} />
      </div>

      <div id="org">
        <OrganizationContainer members={data.organization} />
      </div>

      <footer className="py-12 px-6 text-center border-t border-primary/5 bg-cream">
        <p className="text-secondary/60 text-sm">
          © 2025 Himpunan Mahasiswa Teknologi Konstruksi Bangunan Air. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
