"use client";

import { CalendarDays, ChevronLeft, ChevronRight, Droplets } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import styles from "./WaterCalendar.module.css";

const weekDays = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const sameDay = (first: Date, second: Date) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export default function WaterCalendar() {
  const [today, setToday] = useState<Date | null>(null);
  const [visibleMonth, setVisibleMonth] = useState<Date | null>(null);

  useEffect(() => {
    const syncDate = () => {
      const now = new Date();
      setToday(now);
      setVisibleMonth((current) => current ?? new Date(now.getFullYear(), now.getMonth(), 1));
    };

    syncDate();
    const timer = window.setInterval(syncDate, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const calendarDays = useMemo(() => {
    if (!visibleMonth) return [];
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const leadingEmptyDays = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return Array.from({ length: 42 }, (_, index) => {
      const date = index - leadingEmptyDays + 1;
      return date > 0 && date <= daysInMonth ? date : null;
    });
  }, [visibleMonth]);

  if (!today || !visibleMonth) {
    return (
      <div className={`${styles.shell} mx-auto min-h-[560px] max-w-[1400px] rounded-[2.5rem]`} aria-busy="true" />
    );
  }

  const monthTitle = titleCase(
    new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(visibleMonth),
  );
  const todayName = titleCase(new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(today));
  const todayMonth = titleCase(
    new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(today),
  );
  const viewingCurrentMonth =
    visibleMonth.getFullYear() === today.getFullYear() && visibleMonth.getMonth() === today.getMonth();

  const changeMonth = (amount: number) => {
    setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + amount, 1));
  };

  return (
    <div className={`${styles.shell} mx-auto max-w-[1400px] rounded-[2.5rem] p-6 text-cream sm:p-9 lg:p-12`}>
      <div className={styles.wave} aria-hidden="true" />
      <div className="relative z-10 grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:gap-12">
        <div className="flex flex-col justify-between rounded-[2rem] border border-cta/40 bg-primary/75 p-7 backdrop-blur-sm sm:p-9">
          <div>
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.22em] text-cta">
              <Droplets size={18} aria-hidden="true" /> Kalender HMTKBA
            </p>
            <div className="mt-10 flex items-end gap-5">
              <span className={`${styles.todayRing} grid h-28 w-28 shrink-0 place-items-center rounded-full bg-cta text-6xl font-black text-primary sm:h-32 sm:w-32 sm:text-7xl`}>
                {today.getDate()}
              </span>
              <div className="pb-2">
                <p className="text-2xl font-black sm:text-3xl">{todayName}</p>
                <p className="mt-1 text-sm font-semibold text-cream/75 sm:text-base">{todayMonth}</p>
              </div>
            </div>
            <p className="mt-9 max-w-sm text-base leading-7 text-cream/75">
              Seperti air yang terus mengalir, setiap hari membawa kesempatan baru untuk bertumbuh.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1))}
            disabled={viewingCurrentMonth}
            className="mt-8 inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-cta bg-cta px-5 text-sm font-extrabold text-primary transition hover:bg-cream disabled:cursor-default disabled:border-cream/20 disabled:bg-cream/10 disabled:text-cream/50"
          >
            <CalendarDays size={17} aria-hidden="true" /> {viewingCurrentMonth ? "Bulan saat ini" : "Kembali ke hari ini"}
          </button>
        </div>

        <div className="rounded-[2rem] border border-cta/60 bg-cream p-4 text-primary shadow-2xl shadow-primary/25 backdrop-blur-md sm:p-7">
          <div className="flex items-center justify-between gap-4 px-1 pb-6">
            <button type="button" onClick={() => changeMonth(-1)} className="grid h-11 w-11 place-items-center rounded-full border border-primary/15 bg-primary text-cream transition hover:border-cta hover:bg-cta hover:text-primary" aria-label="Bulan sebelumnya">
              <ChevronLeft size={21} />
            </button>
            <h2 className="text-center text-xl font-black sm:text-2xl" aria-live="polite">{monthTitle}</h2>
            <button type="button" onClick={() => changeMonth(1)} className="grid h-11 w-11 place-items-center rounded-full border border-primary/15 bg-primary text-cream transition hover:border-cta hover:bg-cta hover:text-primary" aria-label="Bulan berikutnya">
              <ChevronRight size={21} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center sm:gap-2">
            {weekDays.map((day) => (
              <div key={day} className="border-b border-cta/60 py-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-primary/75 sm:text-xs">
                {day}
              </div>
            ))}
            {calendarDays.map((day, index) => {
              const cellDate = day ? new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day) : null;
              const isToday = cellDate ? sameDay(cellDate, today) : false;
              return (
                <div
                  key={`${visibleMonth.getTime()}-${index}`}
                  className={`grid aspect-square place-items-center rounded-2xl text-sm font-bold transition sm:text-base ${
                    isToday
                      ? "bg-cta text-primary shadow-lg shadow-primary/20"
                      : day
                        ? "bg-primary/[.06] text-primary hover:bg-primary hover:text-cream"
                        : "text-transparent"
                  }`}
                  aria-current={isToday ? "date" : undefined}
                >
                  {day ?? "0"}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
