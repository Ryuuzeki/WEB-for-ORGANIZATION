import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpenCheck,
  Building2,
  CalendarDays,
  DraftingCompass,
  ExternalLink,
  GraduationCap,
  HardHat,
  Mail,
  MapPin,
  Ruler,
  ShieldCheck,
  Waves,
} from "lucide-react";
import ProgramProfileTabs from "@/presentation/components/ui/ProgramProfileTabs";
import { listNewsItems } from "@/lib/newsRepository";

const competencies = [
  {
    icon: DraftingCompass,
    title: "Perencanaan bangunan air",
    description: "Memahami dasar perencanaan bendungan, saluran, jaringan irigasi, drainase, dan infrastruktur sumber daya air.",
  },
  {
    icon: Waves,
    title: "Hidrologi & hidraulika",
    description: "Membaca perilaku aliran, debit, dan kebutuhan pengendalian air sebagai dasar keputusan teknis.",
  },
  {
    icon: HardHat,
    title: "Pelaksanaan konstruksi",
    description: "Menghubungkan gambar kerja, metode pelaksanaan, mutu, waktu, biaya, dan keselamatan proyek.",
  },
  {
    icon: Ruler,
    title: "Survei & pengukuran",
    description: "Mengolah data lapangan untuk mendukung pemetaan, pengukuran, dan pengendalian pekerjaan konstruksi.",
  },
  {
    icon: Building2,
    title: "Material & struktur",
    description: "Mengenali karakter material serta prinsip struktur yang digunakan pada pekerjaan bangunan air.",
  },
  {
    icon: ShieldCheck,
    title: "Operasi yang berkelanjutan",
    description: "Mempertimbangkan keamanan, kesehatan, keselamatan, lingkungan, operasi, dan pemeliharaan infrastruktur.",
  },
];

const learningFlow = [
  { number: "01", title: "Membaca kondisi", text: "Observasi lapangan, survei, data hidrologi, dan kebutuhan layanan air." },
  { number: "02", title: "Merancang solusi", text: "Menerjemahkan data menjadi alternatif teknis, gambar, dan rencana pelaksanaan." },
  { number: "03", title: "Membangun dengan aman", text: "Mengendalikan metode kerja, mutu, biaya, waktu, dan keselamatan konstruksi." },
  { number: "04", title: "Menjaga keberlanjutan", text: "Memahami operasi, pemeliharaan, evaluasi, dan dampak infrastruktur air." },
];

const leaders = [
  {
    initials: "AP",
    role: "Ketua Program Studi",
    name: "Andi Patiroi, S.T., M.Eng.",
    identifier: "NUPTK 5214108401",
    email: "andi.patiroi@politeknikpu.ac.id",
  },
  {
    initials: "MB",
    role: "Sekretaris Program Studi",
    name: "M. Bagus Hari Santoso, S.T., M.Sc.",
    identifier: "NUPTK 3742773674130372",
    email: "bagushari@politeknikpu.ac.id",
  },
];

export const dynamic = "force-dynamic";

export default async function TechnologyConstructionWaterBuildingPage() {
  const newsItems = (await listNewsItems()).filter((item) => item.isPublished).slice(0, 3);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalProgram",
    name: "Teknologi Konstruksi Bangunan Air",
    educationalCredentialAwarded: "Diploma III",
    occupationalCategory: "Konstruksi dan sumber daya air",
    provider: {
      "@type": "CollegeOrUniversity",
      name: "Politeknik Pekerjaan Umum",
      address: { "@type": "PostalAddress", addressLocality: "Semarang", addressCountry: "ID" },
    },
  };

  return (
    <main className="overflow-hidden bg-white pt-16 lg:pt-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <section className="relative overflow-hidden bg-primary px-5 pb-16 pt-12 text-white sm:px-8 sm:pb-20 sm:pt-16 lg:min-h-[720px] lg:px-10 lg:py-20">
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full border-[64px] border-white/[0.035]" />
        <div className="pointer-events-none absolute -bottom-40 right-0 h-[520px] w-[520px] rounded-full border-[76px] border-sky-300/[0.06]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.045]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

        <div className="relative mx-auto grid max-w-[1440px] items-center gap-12 lg:grid-cols-[1.06fr_.94fr] lg:gap-16">
          <div>
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200/70">
              <Link href="/" className="transition hover:text-white">Beranda</Link>
              <span>/</span>
              <span>Profil Program Studi</span>
            </nav>
            <p className="mt-10 text-xs font-black uppercase tracking-[0.22em] text-cta">Program Studi D-III</p>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.02] tracking-tight text-white sm:text-6xl xl:text-7xl">
              Teknologi Konstruksi Bangunan Air
            </h1>
            <p className="mt-7 max-w-3xl text-base font-medium leading-8 text-white/72 sm:text-lg">
              Program vokasi yang membekali mahasiswa dengan pengetahuan dan keterampilan praktis untuk merancang, membangun, serta mengelola infrastruktur sumber daya air.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-bold backdrop-blur-sm"><GraduationCap size={16} /> Program D-III</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-cta/30 bg-cta/15 px-4 py-2.5 text-xs font-bold text-cream backdrop-blur-sm"><Award size={16} /> Baik Sekali</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-bold backdrop-blur-sm"><MapPin size={16} /> Semarang</span>
            </div>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#profil" className="inline-flex items-center justify-center gap-2 rounded-full bg-cta px-6 py-3.5 text-sm font-black text-primary shadow-xl transition hover:-translate-y-0.5 hover:bg-cream">
                Jelajahi program studi <ArrowRight size={17} />
              </a>
              <Link href="/" className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3.5 text-sm font-black text-white transition hover:bg-white/10">
                Kembali ke HMTKBA
              </Link>
            </div>
          </div>

          <div className="relative mx-auto flex w-full max-w-[560px] items-center justify-center lg:min-h-[540px]">
            <div className="absolute h-[440px] w-[440px] rounded-full border border-sky-200/15 sm:h-[520px] sm:w-[520px]" />
            <div className="absolute h-[320px] w-[320px] rounded-full border border-sky-200/20 sm:h-[390px] sm:w-[390px]" />
            <div className="absolute left-1/2 top-1/2 h-px w-[92%] -translate-x-1/2 bg-gradient-to-r from-transparent via-sky-200/25 to-transparent" />
            <div className="relative grid h-64 w-64 place-items-center rounded-full border border-white/15 bg-white p-7 shadow-[0_30px_90px_rgba(0,0,0,.25)] sm:h-80 sm:w-80 sm:p-10">
              <Image src="/LOGO HIMA.png" alt="Logo HMTKBA" width={320} height={320} className="h-full w-full object-contain" priority />
            </div>
            <div className="absolute bottom-5 left-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-xl sm:left-7">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-200">Ruang belajar</p>
              <p className="mt-1 text-sm font-black text-white">Rekayasa · Konstruksi · Air</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cta">Tentang Program</p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-primary sm:text-5xl">Belajar membangun infrastruktur yang mengalirkan kehidupan.</h2>
          </div>
          <div className="space-y-6 text-base font-medium leading-8 text-secondary/72 sm:text-lg">
            <p>Teknologi Konstruksi Bangunan Air menggabungkan rekayasa sipil, teknologi konstruksi, dan manajemen proyek dalam konteks infrastruktur air seperti bendungan, irigasi, drainase, serta pengelolaan air.</p>
            <p>Pendekatan vokasi menempatkan mahasiswa dekat dengan praktik lapangan, peralatan, data teknis, dan proses kerja proyek agar pembelajaran terhubung dengan kebutuhan industri.</p>
            <a href="https://politeknikpu.ac.id/teknologi-konstruksi-bangunan-air/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-black text-primary underline decoration-cta decoration-2 underline-offset-4">
              Sumber profil resmi Politeknik PU <ExternalLink size={15} />
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1400px]">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cta">Kompetensi Terapan</p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-primary sm:text-5xl">Dari membaca aliran hingga mengendalikan proyek.</h2>
            <p className="mt-5 text-base font-medium leading-7 text-secondary/70">Ruang belajar dirancang untuk menghubungkan teori dasar dengan situasi teknis yang ditemui pada pekerjaan sumber daya air.</p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {competencies.map((item, index) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="group rounded-[1.75rem] border border-primary/8 bg-background/55 p-6 transition hover:-translate-y-1 hover:border-cta/45 hover:shadow-[0_20px_55px_rgba(16,42,107,.1)] sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-cream transition group-hover:bg-cta group-hover:text-primary"><Icon size={22} /></span>
                    <span className="text-xs font-black tracking-[0.2em] text-primary/20">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <h3 className="mt-8 text-xl font-black text-primary">{item.title}</h3>
                  <p className="mt-3 text-sm font-medium leading-6 text-secondary/68">{item.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-primary px-5 py-20 text-white sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-10 lg:grid-cols-[.65fr_1.35fr] lg:gap-16">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cta">Alur Pembelajaran</p>
              <h2 className="mt-4 text-3xl font-black leading-tight text-white sm:text-5xl">Berpikir runtut dari data ke dampak.</h2>
              <p className="mt-5 text-sm font-medium leading-7 text-white/62 sm:text-base">Empat sudut pandang ini membantu mahasiswa memahami siklus pekerjaan bangunan air secara menyeluruh.</p>
            </div>
            <div className="grid gap-px overflow-hidden rounded-[2rem] bg-white/10 sm:grid-cols-2">
              {learningFlow.map((step) => (
                <article key={step.number} className="bg-primary p-7 transition hover:bg-white/[0.055] sm:p-9">
                  <span className="text-xs font-black tracking-[0.2em] text-cta">{step.number}</span>
                  <h3 className="mt-5 text-xl font-black text-white">{step.title}</h3>
                  <p className="mt-3 text-sm font-medium leading-6 text-white/62">{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cta">Pimpinan Program Studi</p>
              <h2 className="mt-4 text-3xl font-black text-primary sm:text-5xl">Pengarah pembelajaran vokasi.</h2>
            </div>
            <p className="max-w-lg text-sm font-medium leading-6 text-secondary/68">Informasi pimpinan mengacu pada profil resmi Program Studi Teknologi Konstruksi Bangunan Air Politeknik PU.</p>
          </div>
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {leaders.map((leader) => (
              <article key={leader.email} className="relative overflow-hidden rounded-[2rem] border border-primary/10 bg-white p-6 shadow-[0_20px_60px_rgba(16,42,107,.08)] sm:p-8">
                <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full border-[30px] border-primary/[0.035]" />
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
                  <div className="grid h-28 w-28 shrink-0 place-items-center rounded-full border-[8px] border-cream bg-primary text-3xl font-black text-cta shadow-lg">{leader.initials}</div>
                  <div>
                    <span className="rounded-full bg-cream px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-primary">{leader.role}</span>
                    <h3 className="mt-4 text-xl font-black leading-tight text-primary sm:text-2xl">{leader.name}</h3>
                    <p className="mt-2 text-xs font-bold uppercase tracking-wide text-secondary/45">{leader.identifier}</p>
                    <a href={`mailto:${leader.email}`} className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-secondary transition hover:text-primary"><Mail size={15} className="text-cta" /> {leader.email}</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-8 flex justify-end">
            <Link href="/dosen" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-xs font-black text-white transition hover:-translate-y-0.5 hover:bg-[#173a8b]">
              Lihat seluruh dosen TKBA <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      <section id="profil" className="scroll-mt-20 bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-10 max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cta">Arah Program Studi</p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-primary sm:text-5xl">Visi, misi, tujuan, dan akreditasi.</h2>
          </div>
          <ProgramProfileTabs />
        </div>
      </section>

      {newsItems.length > 0 && (
        <section className="bg-background px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-[1400px]">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cta">Kabar Mahasiswa</p>
                <h2 className="mt-4 text-3xl font-black text-primary sm:text-5xl">Berita terkait HMTKBA.</h2>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link href="/prestasi" className="inline-flex items-center gap-2 text-sm font-black text-primary">Ruang prestasi <Award size={16} className="text-cta" /></Link>
                <Link href="/#berita" className="inline-flex items-center gap-2 text-sm font-black text-primary">Lihat semua berita <ArrowRight size={16} /></Link>
              </div>
            </div>
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {newsItems.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-[1.75rem] border border-primary/8 bg-white shadow-[0_18px_55px_rgba(16,42,107,.08)]">
                  <div className="photo-frame relative h-56 overflow-hidden bg-primary/5">
                    {/* News images can use administrator-provided external URLs. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl || "/LOGO HIMA.png"} alt={`Foto berita: ${item.title}`} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-wide text-secondary/50"><span className="rounded-full bg-cream px-2.5 py-1 text-primary">{item.category}</span><span className="flex items-center gap-1"><CalendarDays size={12} /> {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(item.publishedAt))}</span></div>
                    <h3 className="mt-4 line-clamp-2 text-xl font-black leading-snug text-primary">{item.title}</h3>
                    <p className="mt-3 line-clamp-3 text-sm font-medium leading-6 text-secondary/65">{item.summary}</p>
                    {item.linkUrl && <a href={item.linkUrl} className="mt-5 inline-flex items-center gap-2 text-xs font-black text-primary">Baca selengkapnya <ArrowRight size={14} /></a>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1400px] overflow-hidden rounded-[2.25rem] bg-primary px-7 py-12 text-center text-white shadow-[0_30px_80px_rgba(16,42,107,.2)] sm:px-12 sm:py-16">
          <BookOpenCheck size={34} className="mx-auto text-cta" />
          <h2 className="mx-auto mt-5 max-w-4xl text-3xl font-black leading-tight text-white sm:text-5xl">Kenali ruang tumbuh mahasiswa Bangunan Air.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-7 text-white/65 sm:text-base">Jelajahi kepengurusan, program kerja, dokumentasi, dan berita terbaru HMTKBA.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/#program" className="inline-flex items-center justify-center gap-2 rounded-full bg-cta px-6 py-3.5 text-sm font-black text-primary transition hover:bg-cream">Lihat program kerja <ArrowRight size={17} /></Link>
            <Link href="/struktur-organisasi" className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3.5 text-sm font-black text-white transition hover:bg-white/10">Struktur organisasi</Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#0b2158] px-5 py-10 text-white/55 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-5 border-t border-white/10 pt-8 text-xs font-semibold sm:flex-row sm:items-center">
          <p>© 2026 HMTKBA · Teknologi Konstruksi Bangunan Air</p>
          <div className="flex flex-wrap gap-5"><Link href="/">Beranda</Link><Link href="/dokumen">Dokumentasi</Link><Link href="/data-center">Data Center</Link></div>
        </div>
      </footer>
    </main>
  );
}
