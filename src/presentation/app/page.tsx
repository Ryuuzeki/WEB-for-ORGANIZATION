import { di } from "@/lib/di";
import { HeroContainer } from "../containers/HeroContainer";
import { VisionMissionContainer } from "../containers/VisionMissionContainer";
import { ServicesContainer } from "../containers/ServicesContainer";
import Link from "next/link";
import { ArrowUpRight, BookOpenCheck, Building2, GraduationCap, Handshake, Waves } from "lucide-react";

const programs = [
  {
    icon: GraduationCap,
    label: "Akademik",
    title: "Lorem Ipsum Dolor",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    icon: Building2,
    label: "Keprofesian",
    title: "Sit Amet Consectetur",
    description: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
  },
  {
    icon: Handshake,
    label: "Pengabdian",
    title: "Adipiscing Elit Sed",
    description: "Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam nisi ut aliquid.",
  },
];

export default async function Home() {
  // UI layer now depends on lib/di instead of infrastructure
  const getLandingPageData = di.getLandingPageData();

  const data = await getLandingPageData.execute();

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <HeroContainer content={data.hero} />

      <section id="program" className="bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-8 lg:grid-cols-[.65fr_1.35fr] lg:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cta">Apa yang kami kerjakan</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-primary sm:text-5xl">Lorem ipsum dolor sit amet consectetur.</h2>
            </div>
            <p className="max-w-2xl text-base leading-8 text-secondary/70 lg:justify-self-end lg:text-lg">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {programs.map((program, index) => {
              const Icon = program.icon;
              return (
                <article key={program.title} className="group relative overflow-hidden rounded-[2rem] border border-primary/10 bg-cream/45 p-7 transition hover:-translate-y-1 hover:bg-cream hover:shadow-xl hover:shadow-primary/8">
                  <span className="absolute right-6 top-5 text-5xl font-black text-primary/[.05]">0{index + 1}</span>
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

      <div id="vision" className="bg-cream">
        <VisionMissionContainer data={data.visionMission} />
      </div>

      <section className="px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-[1400px] overflow-hidden rounded-[2.5rem] bg-primary text-white lg:grid-cols-[1fr_.78fr]">
          <div className="p-8 sm:p-12 lg:p-16">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-200">Data & wawasan</p>
            <h2 className="mt-4 max-w-2xl text-3xl font-black tracking-tight sm:text-5xl">Lorem ipsum dolor sit amet, consectetur adipiscing.</h2>
            <p className="mt-5 max-w-2xl leading-8 text-white/70">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
            <Link href="/data-center" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-cream px-6 text-sm font-bold text-primary transition hover:-translate-y-0.5">
              Buka Data Center <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-px bg-white/10">
            {[["3", "Indikator utama"], ["BMKG", "Sumber klimatologi"], ["2025", "Data terkini"], ["24/7", "Akses informasi"]].map(([value, label]) => (
              <div key={label} className="flex min-h-36 flex-col justify-end bg-secondary/35 p-6 sm:min-h-44 sm:p-8">
                <p className="text-2xl font-black text-cream sm:text-3xl">{value}</p>
                <p className="mt-2 text-xs font-semibold text-sky-100/65">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div id="docs" className="bg-white">
        <ServicesContainer documents={data.documents} />
      </div>

      <section className="bg-white px-5 pb-20 sm:px-8 lg:px-10 lg:pb-28">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-8 rounded-[2rem] border border-primary/10 bg-cream p-8 sm:p-10 lg:flex-row lg:items-center">
          <div className="flex gap-5">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary text-cream"><BookOpenCheck size={26} /></span>
            <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-cta">Lorem ipsum dolor</p><h2 className="mt-2 text-2xl font-black text-primary sm:text-3xl">Sit amet, consectetur adipiscing.</h2><p className="mt-2 text-sm leading-6 text-secondary/65">Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.</p></div>
          </div>
          <Link href="/struktur-organisasi" className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-2xl bg-primary px-6 text-sm font-bold text-cream">Lihat Struktur <ArrowUpRight size={18} /></Link>
        </div>
      </section>

      <footer id="contact" className="bg-[#091d4b] px-5 pb-8 pt-14 text-white sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-10 border-b border-white/10 pb-12 md:grid-cols-[1.4fr_1fr_1fr]">
            <div className="max-w-md"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-cream text-primary"><Waves size={23} /></span><span className="text-xl font-black">HMTKBA</span></div><p className="mt-5 text-sm leading-7 text-white/60">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.</p></div>
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-200">Jelajahi</p><div className="mt-5 grid gap-3 text-sm text-white/65"><Link href="/#vision" className="hover:text-white">Visi & Misi</Link><Link href="/data-center" className="hover:text-white">Data Center</Link><Link href="/dokumen" className="hover:text-white">Dokumentasi</Link><Link href="/struktur-organisasi" className="hover:text-white">Struktur Organisasi</Link></div></div>
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-200">Akses cepat</p><div className="mt-5 grid gap-3 text-sm text-white/65"><Link href="/dokumen" className="hover:text-white">Galeri kegiatan</Link><Link href="/#docs" className="hover:text-white">Pusat dokumen</Link><Link href="/admin/login" className="hover:text-white">Portal pengurus</Link><Link href="/data-center" className="hover:text-white">Wawasan keairan</Link></div></div>
          </div>
          <div className="flex flex-col gap-2 pt-7 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between"><p>© 2025 Himpunan Mahasiswa Teknologi Konstruksi Bangunan Air.</p><p>Lorem ipsum dolor sit amet.</p></div>
        </div>
      </footer>
    </main>
  );
}
