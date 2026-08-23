import React from "react";
import { HeroContent } from "@/domain/entities/HeroContent";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

interface HeroContainerProps {
  content: HeroContent;
}

export const HeroContainer: React.FC<HeroContainerProps> = ({ content }) => {
  const heroWords = ["Himpunan", "Mahasiswa", "Teknologi", "Konstruksi", "Bangunan", "Air"];

  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-28 sm:px-8 lg:px-10 lg:py-14 xl:py-20">
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

        <div className="flex min-h-[400px] items-center justify-center lg:min-h-[620px]">
          <Image
            src="/LOGO HIMA.png"
            alt="Logo Himpunan Mahasiswa Teknologi Konstruksi Bangunan Air"
            width={520}
            height={520}
            className="h-auto w-full max-w-[380px] object-contain drop-shadow-[0_28px_45px_rgba(16,42,107,0.22)] sm:max-w-[430px] lg:max-w-[500px]"
            priority
          />
        </div>
      </div>
    </section>
  );
};
