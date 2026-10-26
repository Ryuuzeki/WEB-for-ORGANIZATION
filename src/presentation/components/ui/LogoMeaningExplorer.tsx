"use client";

import Image from "next/image";
import { useState } from "react";
import { MousePointer2, Sparkles } from "lucide-react";
import type {
  HomeLogoMeaningContent,
  LogoMeaningKey,
} from "@/domain/entities/SiteContent";

type LogoVisual = {
  src: string;
  left: string;
  top: string;
};

const logoVisuals: Record<LogoMeaningKey, LogoVisual> = {
  twoChannels: {
    src: "/logo-meaning/meaning-dua-salur.png",
    left: "31%",
    top: "30%",
  },
  fiveTips: {
    src: "/logo-meaning/meaning-lima-ujung.png",
    left: "72%",
    top: "55%",
  },
  flowDirection: {
    src: "/logo-meaning/meaning-arah-arus.png",
    left: "42%",
    top: "57%",
  },
  whirlpool: {
    src: "/logo-meaning/meaning-pusaran.png",
    left: "54%",
    top: "68%",
  },
};

const logoLayers: Array<{ key: LogoMeaningKey | null; src: string }> = [
  { key: null, src: "/logo-meaning/logo-primary.png" },
  ...Object.entries(logoVisuals).map(([key, visual]) => ({
    key: key as LogoMeaningKey,
    src: visual.src,
  })),
];

export default function LogoMeaningExplorer({
  content,
}: {
  content: HomeLogoMeaningContent;
}) {
  const [selectedKey, setSelectedKey] = useState<LogoMeaningKey | null>(null);
  const [previewKey, setPreviewKey] = useState<LogoMeaningKey | null>(null);
  const activeKey = previewKey ?? selectedKey;
  const activeItem = activeKey
    ? content.items.find((item) => item.key === activeKey)
    : undefined;
  const activeIndex = activeKey
    ? content.items.findIndex((item) => item.key === activeKey)
    : -1;

  const preview = (key: LogoMeaningKey) => setPreviewKey(key);
  const endPreview = () => setPreviewKey(null);
  const select = (key: LogoMeaningKey) => {
    setSelectedKey((current) => (current === key ? null : key));
  };

  return (
    <section
      id="makna-logo"
      className="relative scroll-mt-20 overflow-hidden bg-primary px-5 py-20 text-white sm:px-8 lg:px-10 lg:py-28"
      aria-labelledby="logo-meaning-title"
    >
      <div className="pointer-events-none absolute -left-28 top-24 h-80 w-80 rounded-full border border-white/8" />
      <div className="pointer-events-none absolute -left-14 top-36 h-52 w-52 rounded-full border border-white/8" />
      <div className="pointer-events-none absolute -right-40 bottom-[-14rem] h-[34rem] w-[34rem] rounded-full bg-secondary/45 blur-3xl" />

      <div className="relative mx-auto max-w-[1400px]">
        <div className="grid gap-7 lg:grid-cols-[.72fr_1.28fr] lg:items-end lg:gap-20">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-cta">
              {content.eyebrow}
            </p>
            <h2
              id="logo-meaning-title"
              className="mt-4 max-w-xl text-3xl font-black tracking-tight text-white sm:text-5xl"
            >
              {content.title}
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-8 text-white/68 lg:justify-self-end lg:text-lg">
            {content.description}
          </p>
        </div>

        <div className="mt-12 grid gap-7 xl:grid-cols-[1.08fr_.92fr] xl:items-stretch">
          <div className="relative overflow-hidden rounded-[2.4rem] border border-white/70 bg-[linear-gradient(145deg,#fff_0%,var(--hmtkba-cream)_72%,#f6ddb5_100%)] p-4 shadow-2xl shadow-black/20 sm:p-7">
            <div className="pointer-events-none absolute left-8 top-8 flex items-center gap-2 rounded-full border border-primary/10 bg-white/70 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary shadow-sm backdrop-blur-sm sm:text-xs">
              <Sparkles size={14} className="text-cta" /> Identitas HMTKBA
            </div>

            <p className="sr-only">
              Logo HMTKBA berbentuk tetes air dan pusaran. Empat titik bernomor dapat dipilih untuk membaca makna setiap bagiannya.
            </p>

            <div className="relative mx-auto mt-10 aspect-square w-full max-w-[610px]" aria-label="Bagian interaktif logo">
              {logoLayers.map((layer) => {
                const visible = layer.key === activeKey;
                return (
                  <Image
                    key={layer.src}
                    src={layer.src}
                    alt=""
                    fill
                    sizes="(max-width: 1279px) 86vw, 48vw"
                    className={`object-contain transition-[opacity,transform,filter] duration-500 ease-out motion-reduce:transition-none ${
                      layer.key ? "scale-[1.22]" : "scale-100"
                    } ${
                      visible
                        ? "opacity-100 drop-shadow-[0_18px_26px_rgba(16,42,107,.16)]"
                        : "opacity-0"
                    }`}
                  />
                );
              })}
              {content.items.map((item, index) => {
                const visual = logoVisuals[item.key];
                const isActive = activeKey === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    aria-label={`Jelaskan bagian ${item.title}`}
                    aria-controls="logo-meaning-detail"
                    aria-pressed={selectedKey === item.key}
                    onPointerEnter={() => preview(item.key)}
                    onPointerLeave={endPreview}
                    onFocus={() => preview(item.key)}
                    onBlur={endPreview}
                    onClick={() => select(item.key)}
                    className={`group absolute grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full outline-none transition-all duration-300 motion-reduce:transition-none ${
                      isActive
                        ? "z-20 scale-110 bg-cta text-primary shadow-[0_0_0_8px_rgba(206,162,115,.24),0_12px_28px_rgba(16,42,107,.25)]"
                        : "z-10 bg-white text-primary shadow-[0_8px_24px_rgba(16,42,107,.22)] hover:scale-105 hover:bg-cream"
                    } focus-visible:ring-4 focus-visible:ring-cta/45`}
                    style={{ left: visual.left, top: visual.top }}
                  >
                    <span className="text-sm font-black">{String(index + 1).padStart(2, "0")}</span>
                    <span className={`absolute inset-0 -z-10 rounded-full border ${isActive ? "animate-ping border-cta/50" : "border-primary/15"}`} />
                  </button>
                );
              })}
            </div>

            <div className="relative mt-2 flex items-start gap-2.5 rounded-2xl border border-primary/10 bg-white/72 px-4 py-3 text-xs font-semibold leading-5 text-primary/70 backdrop-blur-sm sm:text-sm">
              <MousePointer2 size={17} className="mt-0.5 shrink-0 text-cta" />
              <span>{content.instruction}</span>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <article
              id="logo-meaning-detail"
              className="relative min-h-64 overflow-hidden rounded-[2.2rem] border border-white/12 bg-white/[.075] p-7 backdrop-blur-sm sm:p-9"
            >
              <span className="absolute right-7 top-6 text-7xl font-black text-white/[.055] sm:text-8xl">
                {activeIndex >= 0 ? String(activeIndex + 1).padStart(2, "0") : "∞"}
              </span>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cta">
                {activeItem ? `Bagian ${activeIndex + 1} dari ${content.items.length}` : content.eyebrow}
              </p>
              <h3 className="mt-5 max-w-md text-2xl font-black text-white sm:text-3xl">
                {activeItem?.title ?? content.overviewTitle}
              </h3>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/68 sm:text-base sm:leading-8">
                {activeItem?.description ?? content.overviewDescription}
              </p>
            </article>

            <div className="grid gap-3 sm:grid-cols-2">
              {content.items.map((item, index) => {
                const isActive = activeKey === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    aria-controls="logo-meaning-detail"
                    aria-pressed={selectedKey === item.key}
                    onPointerEnter={() => preview(item.key)}
                    onPointerLeave={endPreview}
                    onFocus={() => preview(item.key)}
                    onBlur={endPreview}
                    onClick={() => select(item.key)}
                    className={`flex min-h-24 items-center gap-4 rounded-2xl border px-5 py-4 text-left outline-none transition-all duration-300 motion-reduce:transition-none ${
                      isActive
                        ? "-translate-y-0.5 border-cream bg-cream text-primary shadow-xl shadow-black/15"
                        : "border-white/12 bg-white/[.045] text-white hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[.09]"
                    } focus-visible:ring-4 focus-visible:ring-cta/45`}
                  >
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-black ${isActive ? "bg-primary text-cream" : "bg-white/10 text-cta"}`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <span className="block text-xs font-black uppercase tracking-[0.13em] opacity-55">Elemen logo</span>
                      <span className="mt-1 block text-sm font-extrabold sm:text-base">{item.title}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
