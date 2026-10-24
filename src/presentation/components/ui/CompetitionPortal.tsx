"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, CalendarDays, CircleDollarSign, MapPin, Search, Trophy, UsersRound } from "lucide-react";
import type { CompetitionListing } from "@/domain/entities/CompetitionListing";

const filters = [
  { id: "open", label: "Masih dibuka" },
  { id: "all", label: "Semua" },
  { id: "free", label: "Gratis" },
  { id: "online", label: "Online" },
] as const;

export default function CompetitionPortal({ items }: { items: CompetitionListing[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("open");

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesQuery = !normalizedQuery || [item.title, item.organizer, item.mode, item.fee]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
      const matchesFilter =
        filter === "all" ||
        (filter === "open" && !item.isClosed) ||
        (filter === "free" && /gratis|rp\s*0\b/i.test(item.fee)) ||
        (filter === "online" && /online/i.test(item.mode));
      return matchesQuery && matchesFilter;
    });
  }, [filter, items, query]);

  return (
    <div>
      <div className="grid gap-3 rounded-[1.75rem] border border-primary/10 bg-white p-4 shadow-lg shadow-primary/[.04] lg:grid-cols-[1fr_auto] lg:items-center">
        <label className="relative block">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary/45" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari nama lomba atau penyelenggara..."
            className="min-h-12 w-full rounded-2xl border border-primary/10 bg-background/55 pl-12 pr-4 text-sm font-semibold text-primary outline-none transition focus:border-primary/35 focus:bg-white"
          />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter lomba">
          {filters.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`rounded-full px-4 py-2.5 text-xs font-black transition ${filter === item.id ? "bg-primary text-white shadow-md" : "border border-primary/10 bg-background/55 text-primary hover:bg-primary/5"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 px-1">
        <p className="text-xs font-bold text-secondary/55">{visibleItems.length} lomba ditemukan</p>
        <p className="hidden text-xs font-semibold text-secondary/45 sm:block">Khusus lomba yang menerima peserta mahasiswa</p>
      </div>

      {visibleItems.length ? (
        <div className="mt-7 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleItems.map((item, index) => (
            <article key={item.id} className="group flex overflow-hidden rounded-[2rem] border border-primary/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/[.08] md:flex-col">
              <div className="photo-frame relative min-h-44 w-32 shrink-0 overflow-hidden bg-primary sm:w-44 md:h-56 md:w-full">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={`Poster ${item.title}`} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                ) : (
                  <div className="grid h-full place-items-center bg-gradient-to-br from-primary to-secondary text-white"><Trophy size={52} /></div>
                )}
                <span className={`absolute left-3 top-3 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wide shadow-lg ${item.isClosed ? "bg-slate-700 text-white" : "bg-cta text-primary"}`}>
                  {item.isClosed ? "Pendaftaran ditutup" : "Masih dibuka"}
                </span>
                <span className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-white text-xs font-black text-primary shadow-lg">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-cta">
                  <UsersRound size={14} /> Mahasiswa
                </div>
                <h2 className="mt-3 line-clamp-3 text-lg font-black leading-snug text-primary sm:text-xl">{item.title}</h2>
                <p className="mt-2 text-xs font-bold leading-5 text-secondary/55">Diselenggarakan oleh {item.organizer || "Penyelenggara lomba"}</p>
                <dl className="mt-5 grid gap-2.5 text-xs font-semibold text-secondary/70">
                  <div className="flex items-start gap-2"><CalendarDays size={16} className="mt-0.5 shrink-0 text-cta" /><div><dt className="sr-only">Tanggal</dt><dd>{item.dateText || "Lihat jadwal di sumber"}</dd></div></div>
                  <div className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-cta" /><div><dt className="sr-only">Pelaksanaan</dt><dd>{item.mode || "Lihat lokasi di sumber"}</dd></div></div>
                  <div className="flex items-start gap-2"><CircleDollarSign size={16} className="mt-0.5 shrink-0 text-cta" /><div><dt className="sr-only">Biaya</dt><dd>{item.fee || "Lihat biaya di sumber"}</dd></div></div>
                </dl>
                <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-black text-white transition hover:bg-secondary">
                  Lihat detail di InfoLomba <ArrowUpRight size={16} />
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-7 rounded-[2rem] border border-dashed border-primary/20 bg-white px-6 py-16 text-center">
          <Trophy className="mx-auto text-cta" size={42} />
          <h2 className="mt-4 text-xl font-black text-primary">Belum ada lomba yang cocok</h2>
          <p className="mt-2 text-sm text-secondary/60">Coba ubah kata pencarian atau pilih filter Semua.</p>
        </div>
      )}
    </div>
  );
}
