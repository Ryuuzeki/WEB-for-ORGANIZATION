"use client";

import Image from "next/image";
import { ArrowUpRight, Search, UsersRound, X } from "lucide-react";
import { useMemo, useState } from "react";
import { lecturers } from "@/lib/lecturers";

export default function LecturerDirectory() {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("id-ID");
  const filteredLecturers = useMemo(
    () =>
      lecturers.filter((lecturer) =>
        `${lecturer.name} ${lecturer.nuptk}`.toLocaleLowerCase("id-ID").includes(normalizedQuery),
      ),
    [normalizedQuery],
  );

  return (
    <div>
      <div className="rounded-[1.75rem] border border-primary/10 bg-background p-4 shadow-[0_16px_45px_rgba(16,42,107,.07)] sm:p-5">
        <label htmlFor="lecturer-search" className="sr-only">
          Cari nama dosen atau NUPTK
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary/45" size={20} aria-hidden="true" />
            <input
              id="lecturer-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari nama dosen atau NUPTK..."
              className="h-14 w-full rounded-2xl border border-primary/10 bg-white pl-12 pr-12 text-sm font-semibold text-primary outline-none transition placeholder:text-secondary/40 focus:border-cta focus:ring-4 focus:ring-cta/15"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-primary/45 transition hover:bg-primary/8 hover:text-primary"
                aria-label="Hapus pencarian"
              >
                <X size={17} />
              </button>
            )}
          </div>
          <div className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-black text-white sm:min-w-40">
            <UsersRound size={18} className="text-cta" />
            <span aria-live="polite">{filteredLecturers.length} dosen</span>
          </div>
        </div>
      </div>

      {filteredLecturers.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredLecturers.map((lecturer, index) => (
            <article
              key={lecturer.name}
              className="group overflow-hidden rounded-[1.75rem] border border-primary/9 bg-white shadow-[0_16px_50px_rgba(16,42,107,.075)] transition duration-300 hover:-translate-y-1 hover:border-cta/55 hover:shadow-[0_24px_65px_rgba(16,42,107,.13)]"
            >
              <div className="relative aspect-[4/4.3] overflow-hidden bg-[#eef2f8]">
                <div className="absolute inset-x-0 top-0 z-10 h-1.5 bg-gradient-to-r from-primary via-sky-500 to-cta" />
                <Image
                  src={lecturer.image}
                  alt={`Foto ${lecturer.name}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover object-top transition duration-500 group-hover:scale-[1.025]"
                  priority={index < 3}
                />
                <span className="absolute bottom-4 left-4 z-10 rounded-full border border-white/35 bg-primary/90 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-white backdrop-blur-md">
                  Dosen TKBA
                </span>
              </div>
              <div className="p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cta">Teknologi Konstruksi Bangunan Air</p>
                <h3 className="mt-3 min-h-[3.5rem] text-xl font-black leading-snug text-primary">{lecturer.name}</h3>
                <div className="mt-5 flex items-center justify-between gap-4 border-t border-primary/8 pt-5">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-secondary/40">NUPTK</p>
                    <p className="mt-1 text-xs font-bold text-secondary/70">{lecturer.nuptk}</p>
                  </div>
                  <a
                    href={lecturer.profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cream text-primary transition group-hover:bg-primary group-hover:text-white"
                    aria-label={`Buka profil resmi ${lecturer.name}`}
                  >
                    <ArrowUpRight size={18} />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-[2rem] border border-dashed border-primary/20 bg-background px-6 py-16 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-cream text-primary"><Search size={25} /></div>
          <h3 className="mt-5 text-xl font-black text-primary">Dosen tidak ditemukan</h3>
          <p className="mt-2 text-sm font-medium text-secondary/60">Coba gunakan nama atau nomor NUPTK yang berbeda.</p>
          <button type="button" onClick={() => setQuery("")} className="mt-6 rounded-full bg-primary px-5 py-2.5 text-xs font-black text-white">
            Tampilkan semua dosen
          </button>
        </div>
      )}
    </div>
  );
}
