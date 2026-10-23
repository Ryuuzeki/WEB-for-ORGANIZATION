"use client";

import { Search, Sparkles, Trophy, UserRound, UsersRound, X } from "lucide-react";
import { useMemo, useState } from "react";
import { achievements } from "@/lib/achievements";

const types = ["Semua", "Individu", "Kelompok"] as const;
const levels = ["Semua", "Nasional", "Internasional"] as const;

export default function AchievementGallery() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<(typeof types)[number]>("Semua");
  const [level, setLevel] = useState<(typeof levels)[number]>("Semua");

  const filteredAchievements = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id-ID");
    return achievements.filter((achievement) => {
      const searchable = `${achievement.title} ${achievement.organizer} ${achievement.award} ${achievement.students
        .map((student) => `${student.name} ${student.nim}`)
        .join(" ")}`.toLocaleLowerCase("id-ID");
      return (
        (type === "Semua" || achievement.type === type) &&
        (level === "Semua" || achievement.level === level) &&
        searchable.includes(normalizedQuery)
      );
    });
  }, [level, query, type]);

  const resetFilters = () => {
    setQuery("");
    setType("Semua");
    setLevel("Semua");
  };

  return (
    <div>
      <div className="rounded-[2rem] border border-primary/10 bg-background p-4 shadow-[0_18px_50px_rgba(16,42,107,.07)] sm:p-5">
        <div className="relative">
          <label htmlFor="achievement-search" className="sr-only">Cari prestasi, mahasiswa, atau NIM</label>
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary/45" size={20} aria-hidden="true" />
          <input
            id="achievement-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari prestasi, mahasiswa, penyelenggara, atau NIM..."
            className="h-14 w-full rounded-2xl border border-primary/10 bg-white pl-12 pr-12 text-sm font-semibold text-primary outline-none transition placeholder:text-secondary/40 focus:border-cta focus:ring-4 focus:ring-cta/15"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-primary/45 hover:bg-primary/8 hover:text-primary" aria-label="Hapus pencarian">
              <X size={17} />
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex flex-wrap gap-2" aria-label="Filter jenis prestasi">
            {types.map((item) => (
              <button key={item} type="button" onClick={() => setType(item)} aria-pressed={type === item} className={`rounded-full px-4 py-2 text-xs font-black transition ${type === item ? "bg-primary text-white shadow-md" : "border border-primary/10 bg-white text-primary hover:border-cta/60"}`}>
                {item}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {levels.map((item) => (
              <button key={item} type="button" onClick={() => setLevel(item)} aria-pressed={level === item} className={`rounded-full px-4 py-2 text-xs font-black transition ${level === item ? "bg-cta text-primary shadow-md" : "border border-primary/10 bg-white text-primary hover:border-cta/60"}`}>
                {item}
              </button>
            ))}
            <span className="ml-1 inline-flex items-center gap-2 rounded-full bg-primary/7 px-4 py-2 text-xs font-black text-primary" aria-live="polite">
              <Sparkles size={15} className="text-cta" /> {filteredAchievements.length} prestasi
            </span>
          </div>
        </div>
      </div>

      {filteredAchievements.length > 0 ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredAchievements.map((achievement, index) => {
            const isChampion = achievement.award === "Juara 1";
            return (
              <article key={achievement.id} className={`group relative overflow-hidden rounded-[1.75rem] border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_65px_rgba(16,42,107,.12)] sm:p-7 ${achievement.level === "Internasional" ? "border-primary/20 bg-primary text-white" : "border-primary/9 bg-white text-primary"}`}>
                <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full border-[28px] border-cta/[0.09]" />
                <div className="relative flex items-start justify-between gap-4">
                  <div className={`grid h-12 w-12 place-items-center rounded-2xl ${isChampion ? "bg-cta text-primary" : achievement.level === "Internasional" ? "bg-white/10 text-cta" : "bg-cream text-primary"}`}>
                    <Trophy size={22} />
                  </div>
                  <span className={`rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.14em] ${achievement.level === "Internasional" ? "bg-white/10 text-white" : "bg-primary/6 text-primary"}`}>
                    {achievement.level}
                  </span>
                </div>
                <div className="relative mt-7">
                  <p className={`text-xs font-black uppercase tracking-[0.14em] ${achievement.level === "Internasional" ? "text-cta" : "text-cta"}`}>{achievement.award}</p>
                  <h3 className={`mt-3 text-xl font-black leading-snug ${achievement.level === "Internasional" ? "text-white" : "text-primary"}`}>{achievement.title}</h3>
                  <p className={`mt-3 text-xs font-semibold leading-5 ${achievement.level === "Internasional" ? "text-white/55" : "text-secondary/55"}`}>{achievement.organizer}</p>
                </div>
                <div className={`relative mt-6 border-t pt-5 ${achievement.level === "Internasional" ? "border-white/10" : "border-primary/8"}`}>
                  <div className="mb-3 flex items-center gap-2">
                    {achievement.type === "Individu" ? <UserRound size={15} className="text-cta" /> : <UsersRound size={15} className="text-cta" />}
                    <span className={`text-[9px] font-black uppercase tracking-[0.14em] ${achievement.level === "Internasional" ? "text-white/48" : "text-secondary/42"}`}>{achievement.type}</span>
                  </div>
                  <div className="space-y-2.5">
                    {achievement.students.map((student) => (
                      <div key={`${achievement.id}-${student.nim}`} className={`flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 ${achievement.level === "Internasional" ? "bg-white/[0.065]" : "bg-background"}`}>
                        <span className={`text-xs font-bold leading-snug ${achievement.level === "Internasional" ? "text-white/88" : "text-primary"}`}>{student.name}</span>
                        <span className={`shrink-0 text-[10px] font-black ${achievement.level === "Internasional" ? "text-cta" : "text-secondary/45"}`}>{student.nim}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <span className={`absolute bottom-5 right-6 text-[10px] font-black tracking-[0.18em] ${achievement.level === "Internasional" ? "text-white/8" : "text-primary/[0.055]"}`}>{String(index + 1).padStart(2, "0")}</span>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-[2rem] border border-dashed border-primary/20 bg-background px-6 py-16 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-cream text-primary"><Search size={25} /></div>
          <h3 className="mt-5 text-xl font-black text-primary">Prestasi tidak ditemukan</h3>
          <p className="mt-2 text-sm font-medium text-secondary/60">Coba ubah kata pencarian atau pilihan filter.</p>
          <button type="button" onClick={resetFilters} className="mt-6 rounded-full bg-primary px-5 py-2.5 text-xs font-black text-white">Tampilkan semua prestasi</button>
        </div>
      )}
    </div>
  );
}
