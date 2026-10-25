import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Award, ExternalLink, Medal, Sparkles, Trophy, UsersRound } from "lucide-react";
import AchievementGallery from "@/presentation/components/ui/AchievementGallery";
import { achievements, achievementStories } from "@/lib/achievements";
import { getSiteContent } from "@/lib/siteContentRepository";
import { serializeStructuredData } from "@/lib/structuredData";

const individualCount = achievements.filter((item) => item.type === "Individu").length;
const teamCount = achievements.filter((item) => item.type === "Kelompok").length;
const internationalCount = achievements.filter((item) => item.level === "Internasional").length;

export default async function AchievementPage() {
  const siteContent = await getSiteContent();
  const pageContent = siteContent.pages.achievements;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Ruang Apresiasi Prestasi Mahasiswa",
    description: "Galeri prestasi mahasiswa Politeknik Pekerjaan Umum berdasarkan sumber resmi.",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: achievements.length,
      itemListElement: achievements.map((achievement, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `${achievement.award} — ${achievement.title}`,
      })),
    },
  };

  return (
    <main className="overflow-hidden bg-white pt-16 lg:pt-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData(structuredData) }} />

      <section className="relative overflow-hidden bg-primary px-5 pb-20 pt-12 text-white sm:px-8 sm:pt-16 lg:min-h-[730px] lg:px-10 lg:py-20">
        <div className="pointer-events-none absolute inset-0 opacity-[0.045]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="pointer-events-none absolute -left-44 -top-44 h-[520px] w-[520px] rounded-full border-[84px] border-white/[0.035]" />
        <div className="pointer-events-none absolute -bottom-48 right-0 h-[560px] w-[560px] rounded-full border-[82px] border-cta/[0.055]" />
        <div className="relative mx-auto grid max-w-[1440px] items-center gap-14 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
          <div>
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200/70">
              <Link href="/" className="transition hover:text-white">Beranda</Link><span>/</span><span>Prestasi</span>
            </nav>
            <p className="mt-10 text-xs font-black uppercase tracking-[0.22em] text-cta">{pageContent.eyebrow}</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.01] tracking-tight text-white sm:text-6xl xl:text-7xl">{pageContent.title}</h1>
            <p className="mt-7 max-w-2xl text-base font-medium leading-8 text-white/68 sm:text-lg">{pageContent.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-black"><Trophy size={16} className="text-cta" /> {achievements.length} prestasi</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-black"><UsersRound size={16} className="text-cta" /> Individu & kelompok</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-cta/30 bg-cta/15 px-4 py-2.5 text-xs font-black text-cream"><Award size={16} /> Nasional & internasional</span>
            </div>
            <a href="#galeri" className="mt-9 inline-flex items-center justify-center gap-2 rounded-full bg-cta px-6 py-3.5 text-sm font-black text-primary shadow-xl transition hover:-translate-y-0.5 hover:bg-cream">{pageContent.primaryActionText} <ArrowRight size={17} /></a>
          </div>

          <div className="relative min-h-[510px] sm:min-h-[570px]">
            <div className="photo-frame absolute left-0 top-10 h-[70%] w-[68%] overflow-hidden rounded-[2rem] bg-white shadow-2xl sm:left-6">
              <Image src="/prestasi/basket-tkba.jpg" alt="Prestasi Juara 1 basket mahasiswa TKBA" fill sizes="(max-width: 1024px) 70vw, 40vw" className="object-cover object-top" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent" />
            </div>
            <div className="photo-frame absolute bottom-2 right-0 h-[48%] w-[50%] overflow-hidden rounded-[1.75rem] bg-white shadow-2xl sm:right-6">
              <Image src="/prestasi/keila-andromeda.jpg" alt="Prestasi tinju Keila Raesya Nuha" fill sizes="280px" className="object-cover" priority />
            </div>
            <div className="absolute right-0 top-2 grid h-28 w-28 place-items-center rounded-full border-[10px] border-primary bg-cta text-primary shadow-2xl sm:h-36 sm:w-36">
              <div className="text-center"><Medal size={28} className="mx-auto" /><span className="mt-1 block text-[9px] font-black uppercase tracking-[0.18em]">Bangga<br />Berprestasi</span></div>
            </div>
            <div className="absolute bottom-16 left-3 max-w-[240px] rounded-2xl border border-white/15 bg-primary/80 px-5 py-4 backdrop-blur-xl sm:left-0">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cta">Semangat HMTKBA</p>
              <p className="mt-1 text-sm font-black leading-snug text-white">Tumbuh, mencoba, dan membawa pulang kebanggaan.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="mx-auto grid max-w-[1400px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { value: achievements.length, label: "Prestasi terdata", icon: Trophy },
            { value: individualCount, label: "Kejuaraan individu", icon: Medal },
            { value: teamCount, label: "Kejuaraan kelompok", icon: UsersRound },
            { value: internationalCount, label: "Prestasi internasional", icon: Sparkles },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <article key={stat.label} className="rounded-[1.5rem] border border-primary/8 bg-white p-6 shadow-[0_15px_40px_rgba(16,42,107,.06)]">
                <div className="flex items-center justify-between"><span className="text-4xl font-black text-primary">{stat.value}</span><span className="grid h-11 w-11 place-items-center rounded-2xl bg-cream text-primary"><Icon size={20} /></span></div>
                <p className="mt-3 text-xs font-black uppercase tracking-[0.12em] text-secondary/48">{stat.label}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cta">Cerita Prestasi</p>
              <h2 className="mt-4 text-3xl font-black leading-tight text-primary sm:text-5xl">Lebih dari sekadar podium.</h2>
              <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-secondary/65 sm:text-base">Di balik setiap medali ada latihan, kolaborasi, keberanian mencoba, dan proses belajar yang panjang.</p>
            </div>
            <a href="https://politeknikpu.ac.id/prestasi_mahasiswa/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-black text-primary underline decoration-cta decoration-2 underline-offset-4">Sumber resmi prestasi <ExternalLink size={15} /></a>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {achievementStories.map((story) => (
              <article key={story.url} className="group overflow-hidden rounded-[1.75rem] border border-primary/9 bg-white shadow-[0_18px_55px_rgba(16,42,107,.08)]">
                <div className="photo-frame relative h-72 overflow-hidden bg-primary/5"><Image src={story.image} alt={`Foto ${story.title}`} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover transition duration-500 group-hover:scale-105" /></div>
                <div className="p-6"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-cta">{story.date}</p><h3 className="mt-3 text-xl font-black leading-snug text-primary">{story.title}</h3><p className="mt-3 text-sm font-medium leading-6 text-secondary/62">{story.summary}</p><a href={story.url} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-xs font-black text-primary">Baca cerita lengkap <ArrowUpRight size={15} /></a></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="galeri" className="scroll-mt-20 bg-[#f6f8fc] px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1400px]">
          <div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[0.2em] text-cta">Galeri Apresiasi</p><h2 className="mt-4 text-3xl font-black leading-tight text-primary sm:text-5xl">Temukan setiap capaian.</h2><p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-secondary/65 sm:text-base">Cari berdasarkan mahasiswa, NIM, kompetisi, atau penyelenggara. Gunakan filter untuk melihat prestasi individu, kelompok, nasional, maupun internasional.</p></div>
          <div className="mt-12"><AchievementGallery /></div>
          <p className="mt-8 text-xs font-medium leading-6 text-secondary/45">Data dirangkum dari Galeri Prestasi Mahasiswa Politeknik Pekerjaan Umum. Penulisan nama, NIM, tingkat, penyelenggara, dan hasil mengikuti informasi pada sumber resmi.</p>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-8 overflow-hidden rounded-[2.25rem] bg-primary px-7 py-10 text-white shadow-[0_28px_75px_rgba(16,42,107,.18)] sm:px-10 sm:py-12 lg:flex-row lg:items-center">
          <div><p className="text-xs font-black uppercase tracking-[0.2em] text-cta">Terus Bertumbuh</p><h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight sm:text-4xl">Prestasi berikutnya bisa dimulai dari satu keberanian untuk mencoba.</h2></div>
          <Link href="/#program" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-cta px-6 py-3.5 text-sm font-black text-primary transition hover:bg-cream">{pageContent.secondaryActionText} <ArrowRight size={17} /></Link>
        </div>
      </section>

      <footer className="bg-[#0b2158] px-5 py-10 text-white/55 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-5 border-t border-white/10 pt-8 text-xs font-semibold sm:flex-row sm:items-center"><p>© 2026 HMTKBA · Ruang Apresiasi Prestasi</p><div className="flex flex-wrap gap-5"><Link href="/">Beranda</Link><Link href="/teknologi-konstruksi-bangunan-air">Profil Prodi</Link><Link href="/dosen">Dosen TKBA</Link></div></div>
      </footer>
    </main>
  );
}
