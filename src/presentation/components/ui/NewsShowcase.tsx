"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, Newspaper } from "lucide-react";
import type { NewsItem } from "@/domain/entities/NewsItem";

interface NewsShowcaseProps {
  items: NewsItem[];
}

const formatNewsDate = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

export default function NewsShowcase({ items }: NewsShowcaseProps) {
  const publishedItems = useMemo(
    () => items.filter((item) => item.isPublished),
    [items],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || publishedItems.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(
      () => setActiveIndex((current) => (current + 1) % publishedItems.length),
      7000,
    );
    return () => window.clearInterval(timer);
  }, [isPaused, publishedItems.length]);

  if (publishedItems.length === 0) return null;

  const safeActiveIndex = activeIndex % publishedItems.length;
  const activeItem = publishedItems[safeActiveIndex];
  const showPrevious = () =>
    setActiveIndex((current) => (current - 1 + publishedItems.length) % publishedItems.length);
  const showNext = () => setActiveIndex((current) => (current + 1) % publishedItems.length);

  return (
    <section id="berita" className="scroll-mt-20 bg-background px-4 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-[1480px]">
        <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-cta">
              <Newspaper size={16} aria-hidden="true" /> Kabar HMTKBA
            </p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-primary sm:text-5xl">
              Berita & Prestasi
            </h2>
          </div>
          <p className="max-w-xl text-sm font-medium leading-6 text-secondary/70 sm:text-base">
            Cerita kegiatan, pencapaian mahasiswa, dan kabar terbaru dari keluarga besar HMTKBA.
          </p>
        </div>

        <div
          className="relative overflow-hidden rounded-[2rem] bg-primary shadow-[0_32px_80px_rgba(16,42,107,0.18)]"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={() => setIsPaused(false)}
        >
          <div className="grid min-h-[590px] lg:grid-cols-[1.18fr_.82fr]">
            <div className="relative min-h-[390px] overflow-hidden lg:min-h-[590px]">
              <img
                key={activeItem.id}
                src={activeItem.imageUrl || "/LOGO HIMA.png"}
                alt={`Foto berita: ${activeItem.title}`}
                className="absolute inset-0 h-full w-full object-cover animate-fade-in"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/10 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-primary/35" />
              <div className="absolute bottom-5 left-5 flex gap-2 sm:bottom-7 sm:left-7">
                {publishedItems.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={showPrevious}
                      aria-label="Tampilkan berita sebelumnya"
                      className="grid h-12 w-12 place-items-center rounded-full border border-white/35 bg-primary/75 text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-cta hover:text-primary"
                    >
                      <ArrowLeft size={19} />
                    </button>
                    <button
                      type="button"
                      onClick={showNext}
                      aria-label="Tampilkan berita berikutnya"
                      className="grid h-12 w-12 place-items-center rounded-full border border-white/35 bg-primary/75 text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-cta hover:text-primary"
                    >
                      <ArrowRight size={19} />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="relative flex min-h-[420px] flex-col justify-between overflow-hidden px-7 py-9 text-cream sm:px-10 sm:py-12 lg:px-14 lg:py-16">
              <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border-[46px] border-white/[0.055]" />
              <div className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full border border-white/10" />

              <div className="relative" aria-live="polite">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-cta px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
                    {activeItem.category}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-cream/65">
                    <CalendarDays size={14} /> {formatNewsDate(activeItem.publishedAt)}
                  </span>
                </div>
                <h3 key={`${activeItem.id}-title`} className="mt-7 text-3xl font-black leading-[1.08] tracking-tight text-white animate-fade-in sm:text-4xl xl:text-5xl">
                  {activeItem.title}
                </h3>
                <p key={`${activeItem.id}-summary`} className="mt-6 text-sm font-medium leading-7 text-cream/78 animate-fade-in sm:text-base">
                  {activeItem.summary}
                </p>
                {activeItem.linkUrl && (
                  <a
                    href={activeItem.linkUrl}
                    target={activeItem.linkUrl.startsWith("http") ? "_blank" : undefined}
                    rel={activeItem.linkUrl.startsWith("http") ? "noreferrer" : undefined}
                    className="mt-8 inline-flex items-center gap-2 rounded-full bg-cream px-6 py-3.5 text-sm font-black text-primary shadow-lg transition hover:-translate-y-0.5 hover:bg-cta"
                  >
                    Baca selengkapnya <ArrowUpRight size={17} />
                  </a>
                )}
              </div>

              <div className="relative mt-10 flex items-end justify-between gap-5 border-t border-white/10 pt-6">
                <div className="flex gap-2" aria-label="Pilih berita">
                  {publishedItems.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      aria-label={`Tampilkan berita ${index + 1}: ${item.title}`}
                      aria-current={index === safeActiveIndex ? "true" : undefined}
                      className={`h-2 rounded-full transition-all ${index === safeActiveIndex ? "w-10 bg-cta" : "w-2 bg-white/35 hover:bg-white/70"}`}
                    />
                  ))}
                </div>
                <span className="text-xs font-black tracking-[0.18em] text-cream/55">
                  {String(safeActiveIndex + 1).padStart(2, "0")} / {String(publishedItems.length).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
