import type { Metadata } from "next";
import { di } from "@/lib/di";
import { getSiteContent } from "@/lib/siteContentRepository";
import { OrganizationContainer } from "@/presentation/containers/OrganizationContainer";

export const dynamic = "force-dynamic";

const withPeriod = (value: string, period: string) => value.replaceAll("{period}", period);

export async function generateMetadata(): Promise<Metadata> {
  const siteContent = await getSiteContent();
  const content = siteContent.pages.organization;
  const description = withPeriod(content.description, content.period);

  return {
    title: content.title,
    description,
    alternates: { canonical: "/struktur-organisasi" },
    openGraph: {
      title: `${content.title} HMTKBA ${content.period}`,
      description,
      url: "/struktur-organisasi",
    },
  };
}

export default async function StrukturOrganisasiPage() {
  const getOrganizationStructure = di.getOrganizationStructure();
  const [members, siteContent] = await Promise.all([
    getOrganizationStructure.execute(),
    getSiteContent(),
  ]);

  return <OrganizationContainer members={members} content={siteContent.pages.organization} />;
}
