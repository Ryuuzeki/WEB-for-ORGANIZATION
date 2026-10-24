import Link from "next/link";
import { ArrowRight, ExternalLink, RefreshCw, ShieldCheck, Sparkles, Trophy, Waves } from "lucide-react";
import CompetitionPortal from "@/presentation/components/ui/CompetitionPortal";
import { getStudentCompetitions } from "@/lib/competitionRepository";

export const revalidate = 3600;

export default async function StudentCompetitionPage() {
  const feed = await getStudentCompetitions();
  const updatedAt = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(feed.updatedAt));
  const openCount = feed.items.filter((item) => !item.isClosed).length;
  const unavailableSources = feed.sources.filter((source) => !source.available);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Portal Lomba Mahasiswa HMTKBA",
    description: "Agregator informasi lomba mahasiswa dari HMTKBA, InfoLomba.id, dan SiLomba.id.",
    url: "https://hmtkba.vercel.app/portal-lomba",
    isBasedOn: ["https://www.infolomba.id/events?peserta=5", "https://silomba.id/"],
  };

  return (
    <main className="overflow-hidden bg-background pt-16 lg:pt-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <section className="relative overflow-hidden bg-primary px-5 pb-20 pt-14 text-white sm:px-8 lg:px-10 lg:py-24">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at center, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="pointer-events-none absolute -right-28 -top-28 h-[460px] w-[460px] rounded-full border-[74px] border-cta/10" />
        <div className="relative mx-auto grid max-w-[1400px] items-center gap-12 lg:grid-cols-[1.1fr_.9fr] lg:gap-20">
          <div>
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45"><Link href="/" className="hover:text-white">Beranda</Link><span>/</span><span>Portal Lomba</span></nav>
            <p className="mt-10 flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-cta"><Sparkles size={16} /> Peluang Prestasi Mahasiswa</p>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.02] tracking-tight sm:text-6xl xl:text-7xl">Portal Lomba Mahasiswa</h1>
            <p className="mt-7 max-w-2xl text-base font-medium leading-8 text-white/68 sm:text-lg">Temukan kompetisi yang menerima peserta mahasiswa dalam satu ruang yang ringkas, mudah dicari, dan memadukan pilihan HMTKBA dengan pembaruan InfoLomba.id serta SiLomba.id.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2.5 text-xs font-black"><Trophy size={16} className="text-cta" /> {openCount} masih dibuka</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2.5 text-xs font-black"><RefreshCw size={15} className="text-cta" /> Sinkron setiap 1 jam</span>
            </div>
            <a href="#daftar-lomba" className="mt-9 inline-flex items-center justify-center gap-2 rounded-full bg-cta px-6 py-3.5 text-sm font-black text-primary transition hover:bg-cream">Jelajahi lomba <ArrowRight size={17} /></a>
          </div>

          <div className="relative mx-auto grid min-h-[390px] w-full max-w-[520px] place-items-center">
            <div className="absolute h-80 w-80 rounded-full border border-white/15" />
            <div className="absolute h-60 w-60 rounded-full border border-cta/30" />
            <div className="relative grid h-48 w-48 place-items-center rounded-[3rem] bg-cta text-primary shadow-[0_35px_90px_rgba(0,0,0,.28)] rotate-3"><Trophy size={92} strokeWidth={1.6} /></div>
            <div className="absolute bottom-5 left-0 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-xl sm:left-8"><p className="text-[9px] font-black uppercase tracking-[0.2em] text-cta">Terpilih untuk mahasiswa</p><p className="mt-1 text-sm font-black">Data ringkas, sumber tetap transparan.</p></div>
          </div>
        </div>
      </section>

      <section id="daftar-lomba" className="scroll-mt-20 px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cta">Daftar Lomba Terkini</p>
              <h2 className="mt-4 text-3xl font-black leading-tight text-primary sm:text-5xl">Cari peluang, siapkan karya terbaik.</h2>
              <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-secondary/65 sm:text-base">Data terakhir disinkronkan {updatedAt} WIB. Status, biaya, dan jadwal akhir tetap perlu dikonfirmasi pada halaman sumber.</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <a href="https://www.infolomba.id/events?peserta=5" target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-2 text-sm font-black text-primary underline decoration-cta decoration-2 underline-offset-4">InfoLomba <ExternalLink size={15} /></a>
              <a href="https://silomba.id/" target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-2 text-sm font-black text-primary underline decoration-cta decoration-2 underline-offset-4">SiLomba <ExternalLink size={15} /></a>
            </div>
          </div>

          {unavailableSources.length > 0 && (
            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800">{unavailableSources.map((source) => source.name).join(" dan ")} sedang tidak dapat dihubungi. Data dari sumber lain tetap ditampilkan.</div>
          )}

          <div className="mt-12"><CompetitionPortal items={feed.items} /></div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="mx-auto grid max-w-[1400px] gap-5 md:grid-cols-3">
          {[
            { icon: RefreshCw, title: "Pembaruan berkala", text: "Daftar disinkronkan kembali maksimal setiap satu jam saat portal diakses." },
            { icon: ShieldCheck, title: "Sumber transparan", text: "Setiap kartu mencantumkan sumber HMTKBA, InfoLomba, atau SiLomba agar mudah dikonfirmasi." },
            { icon: Waves, title: "Fokus mahasiswa", text: "Portal hanya memuat lomba yang mencantumkan mahasiswa sebagai peserta." },
          ].map((item) => {
            const Icon = item.icon;
            return <article key={item.title} className="rounded-[1.75rem] border border-primary/10 bg-background/45 p-6"><Icon size={23} className="text-cta" /><h2 className="mt-5 text-lg font-black text-primary">{item.title}</h2><p className="mt-2 text-sm font-medium leading-6 text-secondary/60">{item.text}</p></article>;
          })}
        </div>
      </section>

      <footer className="bg-[var(--hmtkba-footer)] px-5 py-10 text-white/55 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-5 border-t border-white/10 pt-8 text-xs font-semibold sm:flex-row sm:items-center"><p>© 2026 HMTKBA · Portal Lomba Mahasiswa</p><p>Informasi bersumber dari <a href="https://www.infolomba.id/" target="_blank" rel="noopener noreferrer" className="text-white underline">InfoLomba.id</a> dan <a href="https://silomba.id/" target="_blank" rel="noopener noreferrer" className="text-white underline">SiLomba.id</a>.</p></div>
      </footer>
    </main>
  );
}
