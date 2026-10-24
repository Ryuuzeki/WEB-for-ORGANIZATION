"use client";

import React, { useState } from "react";
import { Camera, Video, Play, Image as ImageIcon } from "lucide-react";

const mediaItems = [
  {
    id: 1,
    type: "photo",
    title: "Kunjungan Studi Bendungan Jatigede",
    category: "Kunjungan Lapangan",
    date: "12 Januari 2025",
    thumbnail: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?q=80&w=800&auto=format&fit=crop",
    description: "Dokumentasi kunjungan mahasiswa TKBA meninjau struktur fisik & operasional spillway.",
  },
  {
    id: 2,
    type: "video",
    title: "Profil & Kilas Balik Kegiatan HMTKBA 2024/2025",
    category: "Video Proyek",
    date: "20 Februari 2025",
    thumbnail: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "Video rangkuman seluruh perjalanan dan pencapaian himpunan selama satu periode kepengurusan.",
  },
  {
    id: 3,
    type: "photo",
    title: "Pengujian Praktikum Hidrolika & Mekanika Fluida",
    category: "Foto Kegiatan",
    date: "05 Maret 2025",
    thumbnail: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800&auto=format&fit=crop",
    description: "Momen praktikum pengukuran debit air di saluran terbuka menggunakan alat current meter.",
  },
  {
    id: 4,
    type: "video",
    title: "Dokumentasi Lomba Konstruksi Bangunan Air Tingkat Nasional",
    category: "Lomba & Prestasi",
    date: "15 April 2025",
    thumbnail: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=800&auto=format&fit=crop",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "Highlight tim HMTKBA saat meraih Juara 1 pada ajang inovasi bendungan hemat energi.",
  },
  {
    id: 5,
    type: "photo",
    title: "Aksi Reboisasi & Clean Up Daerah Aliran Sungai (DAS)",
    category: "Foto Kegiatan",
    date: "22 Mei 2025",
    thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop",
    description: "Kegiatan pengabdian masyarakat berupa penanaman pohon di bantaran sungai untuk mencegah erosi.",
  },
  {
    id: 6,
    type: "photo",
    title: "Field Trip Observasi Sistem Irigasi Terpadu",
    category: "Kunjungan Lapangan",
    date: "10 Juni 2025",
    thumbnail: "https://images.unsplash.com/photo-1468413253725-0d5181091126?q=80&w=800&auto=format&fit=crop",
    description: "Observasi langsung pembagian air irigasi sudetan bagi lahan pertanian masyarakat lokal.",
  },
];

export default function DokumenPage() {
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [activeVideoModal, setActiveVideoModal] = useState<string | null>(null);

  const categories = ["Semua", "Foto Kegiatan", "Video Proyek", "Kunjungan Lapangan", "Lomba & Prestasi"];

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
            Galeri Foto & Video HMTKBA
          </span>
          <h1 className="mb-5 max-w-full break-words text-3xl font-black leading-[1.05] tracking-tight text-primary min-[380px]:text-4xl sm:text-5xl lg:text-6xl">
            Dokumentasi Kegiatan & Proyek
          </h1>
          <p className="max-w-2xl break-words text-base font-medium leading-8 text-secondary/75 md:text-lg">
            Kumpulan momen bersejarah, dokumentasi lapangan, video kilas balik, dan rekaman jejak prestasi mahasiswa Teknologi Konstruksi Bangunan Air.
          </p>
          </div>
          <div className="grid h-72 min-w-0 grid-cols-2 grid-rows-2 gap-3 sm:h-[430px]">
            {mediaItems.slice(0, 3).map((item, index) => (
              <div key={item.id} className={`photo-frame group relative min-w-0 overflow-hidden rounded-3xl bg-primary/10 ${index === 0 ? "row-span-2" : ""}`}>
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  onError={(event) => { event.currentTarget.style.display = "none"; }}
                  className="h-full min-w-0 w-full object-cover text-transparent transition duration-500 group-hover:scale-105"
                />
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
              Koleksi Media HMTKBA
            </h2>
            <p className="text-secondary/70 text-sm mt-1">
              Telusuri dokumentasi foto dan video berdasarkan kategori kegiatan.
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
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    onError={(event) => { event.currentTarget.style.display = "none"; }}
                    className="h-full min-w-0 w-full object-cover text-transparent transition-transform duration-500 group-hover:scale-105"
                  />
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
                      onClick={() => setActiveVideoModal(item.videoUrl || null)}
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
                    <span>{item.date}</span>
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
            <iframe
              src={activeVideoModal}
              title="Player Video Dokumentasi HMTKBA"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
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
