"use client";

import React, { useState } from "react";
import { Camera, Video, Play, Image as ImageIcon } from "lucide-react";
import { useSiteContent } from "@/presentation/components/ui/SiteShell";
import type { GalleryMedia } from "@/domain/entities/GalleryMedia";

const formatMediaDate = (value: string) => new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
}).format(new Date(`${value}T00:00:00.000Z`));

function MediaVisual({ item, className }: { item: GalleryMedia; className: string }) {
  if (item.type === "video" && !item.thumbnailUrl) {
    return <video src={item.mediaUrl} className={className} muted playsInline preload="metadata" />;
  }
  return <img src={item.thumbnailUrl || item.mediaUrl} alt={item.title} onError={(event) => { event.currentTarget.style.display = "none"; }} className={className} />;
}

export default function DokumenPage({ initialMedia }: { initialMedia: GalleryMedia[] }) {
  const siteContent = useSiteContent();
  const pageContent = siteContent.pages.documents;
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [activeVideoModal, setActiveVideoModal] = useState<string | null>(null);
  const mediaItems = initialMedia.filter((item) => item.isPublished);

  const categories = ["Semua", ...Array.from(new Set(mediaItems.map((item) => item.category)))];

  const filteredMedia = mediaItems.filter(
    (item) => selectedCategory === "Semua" || item.category === selectedCategory
  );

  return (
    <main className="min-h-screen bg-background pb-20 pt-28 lg:pt-20">
      <section className="relative mx-auto mb-16 max-w-[1400px] overflow-hidden px-5 sm:px-8 lg:mb-20 lg:px-10">
        <div className="grid min-w-0 items-center gap-10 lg:grid-cols-[.85fr_1.15fr] lg:gap-14">
          <div className="min-w-0">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider mb-4">
            <Camera className="w-4 h-4" />
            {pageContent.eyebrow}
          </span>
          <h1 className="mb-5 max-w-full break-words text-3xl font-black leading-[1.05] tracking-tight text-primary min-[380px]:text-4xl sm:text-5xl lg:text-6xl">
            {pageContent.title}
          </h1>
          <p className="max-w-2xl break-words text-base font-medium leading-8 text-secondary/75 md:text-lg">
            {pageContent.description}
          </p>
          </div>
          <div className="grid h-72 min-w-0 grid-cols-2 grid-rows-2 gap-3 sm:h-[430px]">
            {mediaItems.slice(0, 3).map((item, index) => (
              <div key={item.id} className={`photo-frame group relative min-w-0 overflow-hidden rounded-3xl bg-primary/10 ${index === 0 ? "row-span-2" : ""}`}>
                <MediaVisual item={item} className="h-full min-w-0 w-full object-cover text-transparent transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent" />
                <span className="absolute bottom-4 left-4 right-4 text-xs font-bold leading-5 text-white">{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">
        <div className="mb-10 flex flex-col justify-between gap-6 border-b border-primary/10 pb-7 md:flex-row md:items-end">
          <div>
            <h2 className="flex items-center gap-3 text-2xl font-black text-primary md:text-3xl">
              <Video className="w-8 h-8 text-sky-600" />
              {pageContent.primaryActionText}
            </h2>
            <p className="text-secondary/70 text-sm mt-1">
              {pageContent.secondaryActionText}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter dokumentasi">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-2.5 text-xs font-black transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-cream shadow-md"
                    : "bg-white text-secondary border border-primary/15 hover:bg-primary/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col justify-between overflow-hidden rounded-[1.75rem] border border-primary/9 bg-white shadow-[0_16px_48px_rgba(16,42,107,.07)] transition-all duration-300 hover:-translate-y-1 hover:border-cta/45 hover:shadow-[0_24px_65px_rgba(16,42,107,.12)]"
            >
              <div>
                {/* Media Image/Video Container */}
                <div className="photo-frame relative aspect-video min-w-0 overflow-hidden bg-primary/10">
                  <MediaVisual item={item} className="h-full min-w-0 w-full object-cover text-transparent transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/90 backdrop-blur-md text-primary shadow-sm">
                      {item.type === "video" ? (
                        <>
                          <Video className="w-3.5 h-3.5 text-red-500" />
                          Video
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-3.5 h-3.5 text-sky-600" />
                          Foto
                        </>
                      )}
                    </span>
                  </div>

                  {item.type === "video" && (
                    <button
                      onClick={() => setActiveVideoModal(item.mediaUrl)}
                      className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-primary/90 text-cream flex items-center justify-center shadow-2xl hover:scale-110 transition-transform group-hover:bg-sky-600"
                      aria-label="Putar video"
                    >
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </button>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-between text-xs text-secondary/60 mb-2 font-medium">
                    <span>{item.category}</span>
                    <span>{formatMediaDate(item.occurredAt)}</span>
                  </div>
                  <h3 className="mb-2 text-lg font-black leading-snug text-primary transition-colors group-hover:text-sky-700">
                    {item.title}
                  </h3>
                  <p className="text-xs text-secondary/80 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filteredMedia.length === 0 && (
          <div className="rounded-[1.75rem] border-2 border-dashed border-primary/15 bg-white/55 px-6 py-16 text-center">
            <ImageIcon className="mx-auto h-10 w-10 text-primary/25" />
            <p className="mt-4 text-sm font-black text-primary">Belum ada media pada kategori ini.</p>
            <p className="mt-2 text-xs font-medium text-secondary/60">Superadmin dapat menambahkan foto dan video melalui panel admin.</p>
          </div>
        )}
      </section>

      {/* Video Modal Player */}
      {activeVideoModal && (
        <div
          className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveVideoModal(null)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/\.(mp4|webm|mov)(\?|$)/i.test(activeVideoModal) || activeVideoModal.includes(".blob.vercel-storage.com/") ? (
              <video src={activeVideoModal} className="h-full w-full" controls autoPlay playsInline />
            ) : (
              <iframe src={activeVideoModal} title="Player Video Dokumentasi HMTKBA" className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            )}
            <button
              onClick={() => setActiveVideoModal(null)}
              className="absolute top-4 right-4 text-white bg-black/60 px-4 py-2 rounded-full font-bold text-xs hover:bg-red-600 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
