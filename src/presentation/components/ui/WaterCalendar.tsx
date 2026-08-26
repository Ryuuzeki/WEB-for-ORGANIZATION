"use client";

import {
  BellRing,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Droplets,
  MapPin,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { CalendarEvent } from "@/domain/entities/CalendarEvent";
import styles from "./WaterCalendar.module.css";

const weekDays = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const sameDay = (first: Date, second: Date) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
const pad = (value: number) => value.toString().padStart(2, "0");
const dateKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const formatEventDate = (value: string) =>
  titleCase(
    new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value)),
  );

interface WaterCalendarProps {
  events?: CalendarEvent[];
}

export default function WaterCalendar({ events = [] }: WaterCalendarProps) {
  const [today, setToday] = useState<Date | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [visibleMonth, setVisibleMonth] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    const syncDate = () => {
      const current = new Date();
      setToday(current);
      setNow(current);
      setVisibleMonth((month) => month ?? new Date(current.getFullYear(), current.getMonth(), 1));
      setSelectedDate((date) => date ?? dateKey(current));
    };

    syncDate();
    const timer = window.setInterval(syncDate, 1_000);
    return () => window.clearInterval(timer);
  }, []);

  const sortedEvents = useMemo(
    () => [...events].sort((first, second) => first.startsAt.localeCompare(second.startsAt)),
    [events],
  );

  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, CalendarEvent[]>();
    sortedEvents.forEach((event) => {
      const eventDate = new Date(event.startsAt);
      if (Number.isNaN(eventDate.getTime())) return;
      const key = dateKey(eventDate);
      grouped.set(key, [...(grouped.get(key) ?? []), event]);
    });
    return grouped;
  }, [sortedEvents]);

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

  const featuredEvent = useMemo(() => {
    if (!now) return null;
    const timestamp = now.getTime();
    const ongoing = sortedEvents.find((event) => {
      const start = new Date(event.startsAt).getTime();
      const end = event.endsAt ? new Date(event.endsAt).getTime() : start;
      return start <= timestamp && end > timestamp;
    });
    return ongoing ?? sortedEvents.find((event) => new Date(event.startsAt).getTime() > timestamp) ?? null;
  }, [now, sortedEvents]);

  const countdown = useMemo(() => {
    if (!featuredEvent || !now) return null;
    const start = new Date(featuredEvent.startsAt).getTime();
    const difference = Math.max(0, start - now.getTime());
    const totalSeconds = Math.floor(difference / 1_000);
    return {
      isOngoing: start <= now.getTime(),
      days: Math.floor(totalSeconds / 86_400),
      hours: Math.floor((totalSeconds % 86_400) / 3_600),
      minutes: Math.floor((totalSeconds % 3_600) / 60),
      seconds: totalSeconds % 60,
    };
  }, [featuredEvent, now]);

  if (!today || !now || !visibleMonth) {
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
  const selectedEvents = selectedDate ? eventsByDate.get(selectedDate) ?? [] : [];

  const changeMonth = (amount: number) => {
    setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + amount, 1));
  };

  return (
    <div className={`${styles.shell} mx-auto max-w-[1400px] rounded-[2.5rem] p-6 text-cream sm:p-9 lg:p-12`}>
      <div className={styles.wave} aria-hidden="true" />
      <div className="relative z-10 grid gap-8 lg:grid-cols-[.78fr_1.22fr] lg:gap-12">
        <div className="flex flex-col rounded-[2rem] border border-cta/40 bg-primary/75 p-7 backdrop-blur-sm sm:p-9">
          <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.22em] text-cta">
            <Droplets size={18} aria-hidden="true" /> Kalender HMTKBA
          </p>
          <div className="mt-8 flex items-end gap-5">
            <span className={`${styles.todayRing} grid h-24 w-24 shrink-0 place-items-center rounded-full bg-cta text-5xl font-black text-primary sm:h-28 sm:w-28 sm:text-6xl`}>
              {today.getDate()}
            </span>
            <div className="pb-2">
              <p className="text-2xl font-black sm:text-3xl">{todayName}</p>
              <p className="mt-1 text-sm font-semibold text-cream/75 sm:text-base">{todayMonth}</p>
            </div>
          </div>

          <div className="mt-8 border-t border-cream/15 pt-7">
            <p className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-cta">
              <BellRing size={16} aria-hidden="true" /> Pengingat terdekat
            </p>
            {featuredEvent && countdown ? (
              <div className="mt-4">
                <h3 className="text-xl font-black leading-snug text-cream">{featuredEvent.title}</h3>
                <p className="mt-2 flex items-start gap-2 text-xs font-semibold leading-5 text-cream/70">
                  <Clock3 size={15} className="mt-0.5 shrink-0 text-cta" aria-hidden="true" />
                  {formatEventDate(featuredEvent.startsAt)}
                </p>
                {featuredEvent.location && (
                  <p className="mt-1.5 flex items-start gap-2 text-xs font-semibold leading-5 text-cream/70">
                    <MapPin size={15} className="mt-0.5 shrink-0 text-cta" aria-hidden="true" />
                    {featuredEvent.location}
                  </p>
                )}

                {countdown.isOngoing ? (
                  <div className="mt-5 rounded-2xl border border-cta/55 bg-cta px-4 py-3 text-center text-sm font-black text-primary">
                    Kegiatan sedang berlangsung
                  </div>
                ) : (
                  <div className="mt-5 grid grid-cols-4 gap-2" aria-label="Hitung mundur menuju kegiatan">
                    {[
                      [countdown.days, "Hari"],
                      [countdown.hours, "Jam"],
                      [countdown.minutes, "Menit"],
                      [countdown.seconds, "Detik"],
                    ].map(([value, label]) => (
                      <div key={label} className="rounded-xl border border-cream/15 bg-cream/10 px-1 py-3 text-center">
                        <strong className="block text-xl font-black text-cta sm:text-2xl">{pad(Number(value))}</strong>
                        <span className="mt-1 block text-[9px] font-bold uppercase tracking-wide text-cream/60">{label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-4 rounded-2xl border border-dashed border-cream/25 p-4 text-sm leading-6 text-cream/65">
                Belum ada kegiatan mendatang. Pengingat baru dari Superadmin akan tampil di sini.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));
              setSelectedDate(dateKey(today));
            }}
            disabled={viewingCurrentMonth && selectedDate === dateKey(today)}
            className="mt-8 inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-cta bg-cta px-5 text-sm font-extrabold text-primary transition hover:bg-cream disabled:cursor-default disabled:border-cream/20 disabled:bg-cream/10 disabled:text-cream/50"
          >
            <CalendarDays size={17} aria-hidden="true" /> Kembali ke hari ini
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
              const key = cellDate ? dateKey(cellDate) : "";
              const isToday = cellDate ? sameDay(cellDate, today) : false;
              const isSelected = Boolean(key && key === selectedDate);
              const dayEvents = key ? eventsByDate.get(key) ?? [] : [];

              if (!cellDate) {
                return <div key={`${visibleMonth.getTime()}-${index}`} className="aspect-square" aria-hidden="true" />;
              }

              return (
                <button
                  type="button"
                  key={`${visibleMonth.getTime()}-${index}`}
                  onClick={() => setSelectedDate(key)}
                  className={`relative grid aspect-square place-items-center rounded-2xl text-sm font-bold transition sm:text-base ${
                    isSelected
                      ? "bg-primary text-cream ring-2 ring-cta ring-offset-2 ring-offset-cream"
                      : isToday
                        ? "bg-cta text-primary shadow-lg shadow-primary/20"
                        : "bg-primary/[.06] text-primary hover:bg-primary hover:text-cream"
                  }`}
                  aria-current={isToday ? "date" : undefined}
                  aria-label={`${day} ${monthTitle}${dayEvents.length ? `, ${dayEvents.length} kegiatan` : ""}`}
                >
                  {day}
                  {dayEvents.length > 0 && (
                    <span className={`absolute bottom-1.5 h-1.5 w-1.5 rounded-full ${isSelected ? "bg-cta" : "bg-primary"}`} aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-6 border-t border-primary/10 pt-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-black">Kegiatan pada tanggal pilihan</h3>
              <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-black text-cream">{selectedEvents.length} acara</span>
            </div>
            {selectedEvents.length > 0 ? (
              <div className="mt-3 grid gap-2.5">
                {selectedEvents.map((event) => (
                  <article key={event.id} className="rounded-2xl border border-cta/45 bg-white/65 p-4">
                    <h4 className="text-sm font-black text-primary">{event.title}</h4>
                    <p className="mt-1.5 text-xs font-semibold text-primary/65">{formatEventDate(event.startsAt)}</p>
                    {event.location && <p className="mt-1 text-xs text-primary/60">{event.location}</p>}
                    {event.description && <p className="mt-2 text-xs leading-5 text-primary/70">{event.description}</p>}
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-3 rounded-2xl bg-primary/[.05] px-4 py-3 text-xs font-semibold text-primary/55">
                Tidak ada kegiatan pada tanggal ini. Tanggal yang memiliki acara ditandai dengan titik.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
