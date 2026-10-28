import { di } from "@/lib/di";
import { HeroContainer } from "../containers/HeroContainer";
import { VisionMissionContainer } from "../containers/VisionMissionContainer";
import { ServicesContainer } from "../containers/ServicesContainer";
import WaterCalendar from "../components/ui/WaterCalendar";
import NewsShowcase from "../components/ui/NewsShowcase";
import LogoMeaningExplorer from "../components/ui/LogoMeaningExplorer";
import { listCalendarEvents } from "@/lib/calendarEvents";
import { listNewsItems } from "@/lib/newsRepository";
import { getSiteContent } from "@/lib/siteContentRepository";
import { serializeStructuredData } from "@/lib/structuredData";
import Link from "next/link";
import {
  AtSign,
  ArrowUpRight,
  Building2,
  ChevronRight,
  Facebook,
  GraduationCap,
  Handshake,
  Instagram,
  Mail,
  MapPin,
  Music2,
  PhoneCall,
  UsersRound,
  Waves,
  Youtube,
} from "lucide-react";

const programIcons = [GraduationCap, Building2, Handshake];
const socialIcons = {
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Music2,
  facebook: Facebook,
  threads: AtSign,
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const dynamic = "force-dynamic";

export default async function Home() {
  const getLandingPageData = di.getLandingPageData();
  const getOrganizationStructure = di.getOrganizationStructure();
  const [data, members, calendarEvents, newsItems, siteContent] = await Promise.all([
    getLandingPageData.execute(),
    getOrganizationStructure.execute(),
    listCalendarEvents(),
    listNewsItems(),
    getSiteContent(),
  ]);

  const leadership = members
    .filter((member) => member.division?.startsWith("BPH"))
    .slice(0, 4);
  const divisions = Array.from(
    new Set(members.map((member) => member.division).filter(Boolean)),
  );
  const footerDescriptionLines = siteContent.home.footer.description
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "StudentOrganization",
    name: "HMTKBA",
    alternateName: "Himpunan Mahasiswa Teknologi Konstruksi Bangunan Air",
    url: "https://hmtkba.vercel.app",
    description: "Organisasi mahasiswa Teknologi Konstruksi Bangunan Air yang berfokus pada pengembangan akademik, keprofesian, dan pengabdian masyarakat.",
  };

  return (
    <main className="overflow-hidden pt-16 lg:pt-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData(structuredData) }} />
      <HeroContainer content={data.hero} />
      <NewsShowcase items={newsItems} />

      <section id="about" className="scroll-mt-20 bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cta">{siteContent.home.about.eyebrow}</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-primary sm:text-5xl">
              {siteContent.home.about.title}
            </h2>
          </div>
          <div className="grid gap-5 text-base leading-8 text-secondary/70 sm:text-lg">
            {siteContent.home.about.paragraphs.map((paragraph, index) => <p key={`${index}-${paragraph}`}>{paragraph}</p>)}
            <div className="mt-2 grid grid-cols-3 gap-3 border-t border-primary/10 pt-6">
              <div><strong className="block text-2xl font-black text-primary">{members.length}+</strong><span className="text-xs font-semibold">{siteContent.home.about.memberLabel}</span></div>
              <div><strong className="block text-2xl font-black text-primary">{divisions.length}</strong><span className="text-xs font-semibold">{siteContent.home.about.divisionLabel}</span></div>
              <div><strong className="block text-2xl font-black text-primary">{siteContent.home.about.programValue}</strong><span className="text-xs font-semibold">{siteContent.home.about.programLabel}</span></div>
            </div>
          </div>
        </div>
      </section>

      <LogoMeaningExplorer content={siteContent.home.logoMeaning} />

      <div id="vision" className="scroll-mt-20 bg-cream">
        <VisionMissionContainer data={data.visionMission} />
      </div>

      <section id="struktur" className="scroll-mt-20 bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cta">{siteContent.home.structure.eyebrow}</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-primary sm:text-5xl">{siteContent.home.structure.title}</h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-secondary/70 sm:text-lg">
                {siteContent.home.structure.description}
              </p>
            </div>
            <Link href="/struktur-organisasi" className="inline-flex min-h-12 w-fit items-center gap-2 rounded-2xl border border-primary/15 bg-cream px-6 text-sm font-bold text-primary transition hover:-translate-y-0.5 hover:bg-white">
              {siteContent.home.structure.buttonText} <ArrowUpRight size={18} />
            </Link>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {leadership.map((member, index) => (
              <article key={member.id} className="group rounded-[2rem] border border-primary/10 bg-cream/45 p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/8">
                <div className="flex items-start justify-between gap-4">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-lg font-black text-cream">{getInitials(member.name)}</span>
                  <span className="text-4xl font-black text-primary/[.06]">0{index + 1}</span>
                </div>
                <h3 className="mt-6 text-lg font-extrabold text-primary">{member.name}</h3>
                <p className="mt-1 text-sm font-semibold text-cta">{member.role}</p>
                <p className="mt-3 text-xs text-secondary/55">
                  {siteContent.pages.organization.divisionPeriodLabel.replaceAll("{period}", siteContent.pages.organization.period)}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-2.5">
            {divisions.map((division) => (
              <span key={division} className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white px-4 py-2 text-xs font-bold text-secondary/75 shadow-sm">
                <UsersRound size={15} className="text-cta" /> {division}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="program" className="scroll-mt-20 bg-cream px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-8 lg:grid-cols-[.65fr_1.35fr] lg:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cta">{siteContent.home.program.eyebrow}</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-primary sm:text-5xl">{siteContent.home.program.title}</h2>
            </div>
            <p className="max-w-2xl text-base leading-8 text-secondary/70 lg:justify-self-end lg:text-lg">
              {siteContent.home.program.description}
            </p>
          </div>
          <div className={siteContent.home.program.items.length > 3 ? "mt-12 flex flex-wrap justify-center gap-5" : "mt-12 grid gap-5 md:grid-cols-3"}>
            {siteContent.home.program.items.map((program, index) => {
              const Icon = programIcons[index % programIcons.length];
              return (
                <article key={`${index}-${program.title}`} className={`group relative min-w-0 overflow-hidden rounded-[2rem] border border-primary/10 bg-white p-7 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/8 ${siteContent.home.program.items.length > 3 ? "w-full sm:w-[calc(50%-0.625rem)] xl:w-[calc(25%-0.9375rem)]" : ""}`}>
                  <span className="absolute right-6 top-5 text-5xl font-black text-primary/[.05]">{String(index + 1).padStart(2, "0")}</span>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-cream"><Icon size={23} /></span>
                  <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-cta">{program.label}</p>
                  <h3 className="mt-2 text-xl font-extrabold text-primary">{program.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-secondary/70">{program.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <WaterCalendar events={calendarEvents} content={siteContent.home.calendar} />
      </section>

      <div id="docs" className="bg-white">
        <ServicesContainer documents={data.documents} content={siteContent.home.documents} />
      </div>

      <footer id="contact" className="bg-[var(--hmtkba-footer)] px-5 pb-8 pt-14 text-white sm:px-8 lg:px-10 lg:pt-20">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-11 flex max-w-2xl items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cream text-primary shadow-lg shadow-black/10"><Waves size={24} /></span>
            <div>
              <p className="text-xl font-black">{siteContent.home.footer.brandTitle}</p>
              <div className="mt-2 text-sm leading-7 text-white/60">
                {footerDescriptionLines.map((line, index) => (
                  <p key={`${index}-${line}`} className="block">
                    {index === 0 && line === "Sekretariat HMTKBA" ? (
                      <strong className="font-extrabold text-white/85">{line}</strong>
                    ) : line}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-12 border-b border-white/10 pb-12 lg:grid-cols-[1.15fr_.85fr] lg:gap-20">
            <section aria-labelledby="footer-contact-title">
              <h2 id="footer-contact-title" data-title-motion="off" className="flex items-center gap-3 text-lg font-black">
                <span className="h-6 w-1 rounded-full bg-amber-400" />
                {siteContent.home.footer.contactTitle}
              </h2>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                {siteContent.home.footer.campuses.map((campus, index) => {
                  const card = (
                    <>
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-400/12 text-amber-400"><MapPin size={19} /></span>
                      <span className="min-w-0">
                        <strong className="block text-sm font-extrabold text-white">{campus.name}</strong>
                        <span className="mt-1 block text-sm leading-6 text-white/55">{campus.address}</span>
                      </span>
                      {campus.mapUrl && <ArrowUpRight size={16} className="ml-auto shrink-0 text-white/35" />}
                    </>
                  );

                  return campus.mapUrl ? (
                    <a key={`${campus.name}-${index}`} href={campus.mapUrl} target="_blank" rel="noreferrer" className="flex min-h-32 items-start gap-3 rounded-2xl border border-white/10 bg-white/[.035] p-5 transition hover:-translate-y-0.5 hover:border-amber-400/35 hover:bg-white/[.06]">{card}</a>
                  ) : (
                    <div key={`${campus.name}-${index}`} className="flex min-h-32 items-start gap-3 rounded-2xl border border-white/10 bg-white/[.035] p-5">{card}</div>
                  );
                })}
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <a href={`tel:${siteContent.home.footer.phone.replace(/[^+\d]/g, "")}`} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.035] p-5 transition hover:border-amber-400/35 hover:bg-white/[.06]">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-400/12 text-amber-400"><PhoneCall size={19} /></span>
                  <span><strong className="block text-sm font-extrabold">Hubungi Telepon & Chat</strong><span className="mt-1 block text-sm text-white/55">{siteContent.home.footer.phone}</span></span>
                </a>
                {siteContent.home.footer.email && (
                  <a href={`mailto:${siteContent.home.footer.email}`} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.035] p-5 transition hover:border-amber-400/35 hover:bg-white/[.06]">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-400/12 text-amber-400"><Mail size={19} /></span>
                    <span><strong className="block text-sm font-extrabold">Surat Elektronik Resmi</strong><span className="mt-1 block text-sm text-white/55">{siteContent.home.footer.email}</span></span>
                  </a>
                )}
              </div>
            </section>

            <section aria-labelledby="footer-social-title">
              <h2 id="footer-social-title" data-title-motion="off" className="flex items-center gap-3 text-lg font-black">
                <span className="h-6 w-1 rounded-full bg-amber-400" />
                {siteContent.home.footer.connectTitle}
              </h2>
              <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {siteContent.home.footer.socialLinks.map((social) => {
                  const Icon = socialIcons[social.platform];
                  const content = <><Icon size={20} className="text-amber-400" /><span className="font-bold">{social.label}</span><ChevronRight size={18} className="ml-auto text-white/30" /></>;
                  return social.url ? (
                    <a key={social.platform} href={social.url} target="_blank" rel="noreferrer" className="flex min-h-14 items-center gap-4 rounded-2xl border border-white/10 bg-white/[.035] px-5 text-sm transition hover:translate-x-1 hover:border-amber-400/35 hover:bg-white/[.06]">{content}</a>
                  ) : (
                    <div key={social.platform} className="flex min-h-14 items-center gap-4 rounded-2xl border border-white/10 bg-white/[.025] px-5 text-sm text-white/75">{content}</div>
                  );
                })}
              </div>
            </section>
          </div>

          <nav aria-label="Tautan footer" className="flex flex-wrap gap-x-5 gap-y-3 pt-7 text-xs font-semibold text-white/55">
            <Link href="/#about" className="transition hover:text-white">Tentang Kami</Link>
            <Link href="/#struktur" className="transition hover:text-white">Struktur</Link>
            <Link href="/dokumen" className="transition hover:text-white">Dokumentasi</Link>
            <Link href="/portal-lomba" className="transition hover:text-white">Portal Lomba</Link>
            <Link href="/data-center" className="transition hover:text-white">Data Center</Link>
            <Link href="/admin/login" className="transition hover:text-white">Portal Pengurus</Link>
          </nav>
          <div className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between"><p>{siteContent.home.footer.copyright}</p><p>{siteContent.home.footer.closingText}</p></div>
        </div>
      </footer>
    </main>
  );
}
