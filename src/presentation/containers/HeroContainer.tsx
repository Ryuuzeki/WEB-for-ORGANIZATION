import React from "react";
import { HeroContent } from "@/domain/entities/HeroContent";
import Link from "next/link";
import { ArrowRight, BookOpenText, ShieldCheck, Sparkles, UsersRound } from "lucide-react";

interface HeroContainerProps {
  content: HeroContent;
}

export const HeroContainer: React.FC<HeroContainerProps> = ({ content }) => {
  const heroWords = ["Himpunan", "Mahasiswa", "Teknologi", "Konstruksi", "Bangunan", "Air"];

  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-28 sm:px-8 lg:px-10 lg:py-14 xl:py-20">
      <div className="absolute -right-40 top-0 h-96 w-96 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />
      <div className="mx-auto grid max-w-[1400px] items-center gap-10 lg:grid-cols-[1.02fr_.98fr] xl:gap-16">
        <div className="relative z-10">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-primary shadow-sm backdrop-blur">
            <Sparkles size={15} className="text-cta" />
            Kabinet Amerta Abhinaya · 2024/2025
          </div>
          <h1
            className="max-w-4xl text-4xl font-black leading-[1.06] tracking-[-0.045em] text-primary sm:text-5xl xl:text-7xl"
            aria-label="Himpunan Mahasiswa Teknologi Konstruksi Bangunan Air"
          >
            {heroWords.map((word, index) => (
              <span
                key={word}
                aria-hidden="true"
                className="hero-fade-word mr-[0.22em] inline-block"
                style={{ animationDelay: `${120 + index * 115}ms` }}
              >
                {word}
              </span>
            ))}
          </h1>
          <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-secondary/80 sm:text-lg">
            {content.subtitle}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="#program" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-bold text-cream shadow-xl shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-secondary">
              {content.ctaText}
              <ArrowRight size={18} />
            </Link>
            <Link href="#about" className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-primary/15 bg-white/70 px-6 text-sm font-bold text-primary transition hover:bg-white">
              Kenali HMTKBA
            </Link>
          </div>
          <div className="mt-10 grid max-w-2xl grid-cols-3 gap-3 border-t border-primary/10 pt-6">
            {[
              ["80+", "Anggota aktif"],
              ["7", "Divisi kolaboratif"],
              ["12+", "Agenda tahunan"],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="text-2xl font-black text-primary sm:text-3xl">{value}</p>
                <p className="mt-1 text-[11px] font-semibold leading-4 text-secondary/60 sm:text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[470px] lg:min-h-[620px]">
          <div className="absolute inset-3 overflow-hidden rounded-[2.5rem] bg-[radial-gradient(circle_at_72%_22%,rgba(89,144,192,.75),transparent_34%),linear-gradient(145deg,#015185_0%,#102a6b_52%,#091d4b_100%)] shadow-2xl shadow-primary/20 sm:inset-6">
            <div className="absolute -right-24 top-10 h-72 w-72 rounded-full border-[42px] border-white/10" aria-hidden="true" />
            <div className="absolute left-12 top-24 h-44 w-44 rounded-full border border-white/15" aria-hidden="true" />
            <div className="absolute left-20 top-32 h-28 w-28 rounded-full border border-white/15" aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-primary via-primary/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-white sm:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-200">Ruang tumbuh mahasiswa</p>
              <p className="mt-3 max-w-lg text-2xl font-bold leading-tight sm:text-3xl">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
          </div>
          <div className="absolute left-0 top-12 rounded-2xl border border-white/60 bg-white/90 p-4 shadow-xl backdrop-blur sm:left-1">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-100 text-primary"><UsersRound size={20} /></span>
              <div><p className="text-sm font-extrabold text-primary">Lorem ipsum</p><p className="text-xs text-secondary/60">Dolor sit amet</p></div>
            </div>
          </div>
          <div className="absolute bottom-8 right-0 rounded-2xl border border-white/60 bg-cream/95 p-4 shadow-xl backdrop-blur sm:right-1">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-cream"><ShieldCheck size={20} /></span>
              <div><p className="text-sm font-extrabold text-primary">Consectetur</p><p className="text-xs text-secondary/60">Adipiscing elit</p></div>
            </div>
          </div>
          <div className="absolute right-1 top-9 hidden rounded-2xl bg-cta px-4 py-3 text-primary shadow-xl sm:block">
            <BookOpenText size={19} />
          </div>
        </div>
      </div>
    </section>
  );
};
