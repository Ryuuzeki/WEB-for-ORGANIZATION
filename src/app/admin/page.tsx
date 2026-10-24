import { redirect } from "next/navigation";
import { di } from "@/lib/di";
import { getAdminSessionAction } from "@/application/actions/adminActions";
import AdminDashboardPage from "@/presentation/app/admin/page";
import { RegionalStat } from "@/domain/entities/RegionalStat";
import { listCalendarEvents } from "@/lib/calendarEvents";
import { listNewsItems } from "@/lib/newsRepository";
import { getSiteContent } from "@/lib/siteContentRepository";

export const metadata = {
  title: "Dashboard Admin - HMTKBA",
  description: "Dashboard kontrol konten Himpunan Mahasiswa Teknologi Konstruksi Bangunan Air.",
};

export default async function Page() {
  const session = await getAdminSessionAction();

  if (!session) {
    redirect("/admin/login");
  }
  
  // Load initial content to display and edit in the dashboard
  const landingPageData = await di.getLandingPageData().execute();
  const allMembers = await di.getOrganizationStructure().execute();
  const [calendarEvents, newsItems, siteContent] = await Promise.all([
    listCalendarEvents(),
    listNewsItems(),
    getSiteContent(),
  ]);
  const members = session.canManageAllDivisions
    ? allMembers
    : allMembers.filter((member) => member.division === session.memberDivision);
  
  // Load regional stats for default regions
  const regions = ["Indonesia", "Jawa Barat", "Jawa Timur", "Jawa Tengah", "Sumatera Utara", "Sulawesi Selatan"];
  const regionalStats: Record<string, RegionalStat[]> = {};
  for (const region of regions) {
    regionalStats[region] = await di.getRegionalStatRepository().getStatsByRegion(region);
  }
  
  return (
    <AdminDashboardPage 
      initialHero={landingPageData.hero}
      initialVisionMission={landingPageData.visionMission}
      initialMembers={members}
      initialDocuments={landingPageData.documents}
      initialRegionalStats={regionalStats}
      initialCalendarEvents={calendarEvents}
      initialNewsItems={newsItems}
      initialSiteContent={siteContent}
      regions={regions}
      adminSession={session}
    />
  );
}
