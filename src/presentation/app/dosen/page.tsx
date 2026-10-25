import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, ExternalLink, GraduationCap, Microscope, UsersRound, Waves } from "lucide-react";
import LecturerDirectory from "@/presentation/components/ui/LecturerDirectory";
import { lecturers } from "@/lib/lecturers";
import { getSiteContent } from "@/lib/siteContentRepository";
import { serializeStructuredData } from "@/lib/structuredData";

const featuredLecturers = [lecturers[0], lecturers[1], lecturers[10]];

export default async function LecturersPage() {
  const siteContent = await getSiteContent();
  const pageContent = siteContent.pages.lecturers;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Dosen Teknologi Konstruksi Bangunan Air",
    numberOfItems: lecturers.length,
    itemListElement: lecturers.map((lecturer, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Person",
        name: lecturer.name,
        identifier: lecturer.nuptk === "–" ? undefined : lecturer.nuptk,
        affiliation: "Program Studi Teknologi Konstruksi Bangunan Air, Politeknik Pekerjaan Umum",
        sameAs: lecturer.profileUrl,
      },
    })),
  };

  return (
    <main className="overflow-hidden bg-white pt-16 lg:pt-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData(structuredData) }} />

      <section className="relative overflow-hidden bg-background px-5 pb-20 pt-12 sm:px-8 sm:pt-16 lg:min-h-[700px] lg:px-10 lg:py-20">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[43%] bg-primary xl:block" />
        <div className="pointer-events-none absolute -left-40 -top-40 h-[440px] w-[440px] rounded-full border-[70px] border-primary/[0.025]" />
        <div className="relative mx-auto grid max-w-[1440px] items-center gap-14 xl:grid-cols-[1.05fr_.95fr] xl:gap-20">
          <div className="relative z-10">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary/45">
              <Link href="/" className="transition hover:text-primary">Beranda</Link>
              <span>/</span>
              <Link href="/teknologi-konstruksi-bangunan-air" className="transition hover:text-primary">Profil Prodi</Link>
              <span>/</span>
              <span>Dosen</span>
            </nav>
            <p className="mt-10 text-xs font-black uppercase tracking-[0.22em] text-cta">{pageContent.eyebrow}</p>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.02] tracking-tight text-primary sm:text-6xl xl:text-7xl">
              {pageContent.title}
            </h1>
            <p className="mt-7 max-w-2xl text-base font-medium leading-8 text-secondary/68 sm:text-lg">
              {pageContent.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white px-4 py-2.5 text-xs font-black text-primary shadow-sm"><UsersRound size={16} /> {lecturers.length} dosen</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white px-4 py-2.5 text-xs font-black text-primary shadow-sm"><GraduationCap size={16} /> Program D-III</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-cta/35 bg-cta/15 px-4 py-2.5 text-xs font-black text-primary"><Waves size={16} /> TKBA</span>
            </div>
            <a href="#direktori" className="mt-9 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-black text-white shadow-xl shadow-primary/15 transition hover:-translate-y-0.5 hover:bg-[#173a8b]">
              {pageContent.primaryActionText} <ArrowRight size={17} />
            </a>
          </div>

          <div className="relative overflow-hidden rounded-[2.5rem] bg-primary p-5 shadow-[0_34px_90px_rgba(16,42,107,.25)] sm:p-8 xl:rounded-none xl:bg-transparent xl:p-0 xl:shadow-none">
            <div className="pointer-events-none absolute inset-0 opacity-[0.055]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)", backgroundSize: "42px 42px" }} />
            <div className="pointer-events-none absolute -right-24 top-14 h-72 w-72 rounded-full border-[46px] border-sky-300/[0.08]" />
            <div className="relative mx-auto max-w-[620px]">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                {featuredLecturers.map((lecturer) => (
                  <div key={lecturer.name} className="photo-frame relative aspect-[3/4] overflow-hidden rounded-[1.5rem] bg-white shadow-2xl">
                    <Image src={lecturer.image} alt={`Foto ${lecturer.name}`} fill sizes="(max-width: 640px) 45vw, 210px" className="object-contain object-bottom" priority />
                  </div>
                ))}
              </div>
              <div className="relative z-10 mt-4 max-w-md rounded-2xl border border-white/15 bg-[#0b2866] px-5 py-4 text-white shadow-xl">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cta">Satu tim, satu arah</p>
                <p className="mt-1 text-sm font-black">Mendampingi pembelajaran vokasi yang dekat dengan lapangan.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary px-5 py-16 text-white sm:px-8 lg:px-10 lg:py-20">
        <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center lg:gap-20">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cta">Ruang Akademik TKBA</p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-white sm:text-5xl">Menghubungkan teori, riset, dan praktik.</h2>
          </div>
          <div className="grid gap-px overflow-hidden rounded-[1.75rem] bg-white/10 sm:grid-cols-3">
            {[
              { icon: BookOpenCheck, title: "Pendidikan", text: "Pembelajaran vokasi berbasis kompetensi." },
              { icon: Microscope, title: "Penelitian", text: "Kajian yang mendukung perkembangan keilmuan." },
              { icon: Waves, title: "Pengabdian", text: "Pengetahuan yang memberi manfaat bagi masyarakat." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="bg-primary p-6 transition hover:bg-white/[0.05]">
                  <Icon size={23} className="text-cta" />
                  <h3 className="mt-5 text-lg font-black">{item.title}</h3>
                  <p className="mt-2 text-xs font-medium leading-5 text-white/58">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="direktori" className="scroll-mt-20 bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cta">Direktori Dosen</p>
              <h2 className="mt-4 text-3xl font-black leading-tight text-primary sm:text-5xl">Temukan dosen TKBA.</h2>
              <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-secondary/65 sm:text-base">Gunakan pencarian untuk menemukan nama atau NUPTK. Pilih tombol pada kartu untuk membuka profil resmi di situs Politeknik PU.</p>
            </div>
            <a href="https://politeknikpu.ac.id/dosen-teknologi-konstruksi-bangunan-air/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-black text-primary underline decoration-cta decoration-2 underline-offset-4">
              Lihat sumber resmi <ExternalLink size={15} />
            </a>
          </div>
          <div className="mt-12"><LecturerDirectory /></div>
        </div>
      </section>

      <section className="bg-background px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-8 overflow-hidden rounded-[2.25rem] bg-primary px-7 py-10 text-white shadow-[0_28px_75px_rgba(16,42,107,.18)] sm:px-10 sm:py-12 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cta">Kenali Program Studi</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-black leading-tight sm:text-4xl">Lihat kompetensi, visi, misi, dan ruang belajar TKBA.</h2>
          </div>
          <Link href="/teknologi-konstruksi-bangunan-air" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-cta px-6 py-3.5 text-sm font-black text-primary transition hover:bg-cream">
            {pageContent.secondaryActionText} <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <footer className="bg-[#0b2158] px-5 py-10 text-white/55 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-5 border-t border-white/10 pt-8 text-xs font-semibold sm:flex-row sm:items-center">
          <p>© 2026 HMTKBA · Dosen Teknologi Konstruksi Bangunan Air</p>
          <div className="flex flex-wrap gap-5"><Link href="/">Beranda</Link><Link href="/teknologi-konstruksi-bangunan-air">Profil Prodi</Link><Link href="/dokumen">Dokumentasi</Link></div>
        </div>
      </footer>
    </main>
  );
}
