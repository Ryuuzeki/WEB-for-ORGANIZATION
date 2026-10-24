import React from "react";
import { Typography } from "../components/ui/Typography";
import {
  Cloud,
  Droplets,
  Thermometer,
  Wind,
  BarChart3,
  Calendar,
  Waves
} from "lucide-react";
import { ClimateData } from "@/domain/entities/ClimateData";
import { RegionalStat } from "@/domain/entities/RegionalStat";

interface DataCenterContainerProps {
  climate: ClimateData;
  stats: RegionalStat[];
}

export const DataCenterContainer: React.FC<DataCenterContainerProps> = ({ climate, stats }) => {
  return (
    <main className="min-h-screen bg-background px-5 pb-20 pt-28 sm:px-8 lg:px-10 lg:pt-20">
      <div className="mx-auto max-w-[1400px]">
        <section className="mb-10 max-w-3xl sm:mb-12">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cta">Data & Wawasan</p>
          <Typography variant="h1" className="mb-4 mt-4 text-primary">Data Center HMTKBA</Typography>
          <Typography variant="p" className="max-w-2xl font-medium text-secondary/70">
            Monitor kondisi klimatologi dan statistik infrastruktur air nasional dalam tampilan yang ringkas.
          </Typography>
        </section>

        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
        {/* Climate Card */}
        <article className="overflow-hidden rounded-[2rem] border border-primary/8 bg-white shadow-[0_18px_55px_rgba(16,42,107,.07)] lg:col-span-1">
          <div className="bg-primary p-6 text-cream sm:p-8">
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h3">Cuaca Saat Ini</Typography>
              <Cloud size={24} className="text-accent" />
            </div>
            <Typography variant="p" className="text-sm opacity-80">{climate.region}</Typography>
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Thermometer className="text-cta" size={32} />
                <div>
                  <Typography variant="h2" className="text-primary leading-none">{climate.temperature}</Typography>
                  <Typography variant="span" className="text-xs text-slate-500">Suhu Udara</Typography>
                </div>
              </div>
              <Typography variant="p" className="font-bold text-secondary">{climate.weatherCondition}</Typography>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-2 rounded-xl bg-cream p-3.5">
                <Droplets className="text-accent" size={18} />
                <Typography variant="span" className="text-sm font-medium">{climate.humidity}</Typography>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-cream p-3.5">
                <Wind className="text-secondary" size={18} />
                <Typography variant="span" className="text-sm font-medium">{climate.windSpeed}</Typography>
              </div>
            </div>

            <Typography variant="p" className="text-[10px] text-slate-400 mt-4 text-center">
              Sumber: BMKG | Update: {new Date(climate.lastUpdated).toLocaleString('id-ID')}
            </Typography>
          </div>
        </article>

        {/* Stats Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:col-span-2">
          {stats.map((stat, index) => (
            <article key={index} className="flex min-h-64 flex-col justify-between rounded-[1.75rem] border border-primary/8 bg-white p-6 shadow-[0_14px_45px_rgba(16,42,107,.055)] transition hover:-translate-y-1 hover:border-cta/45 hover:shadow-[0_20px_55px_rgba(16,42,107,.1)] sm:p-7">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 rounded-xl bg-sky-100 text-primary">
                    {stat.category.includes("Air") ? <Waves size={24} /> : <BarChart3 size={24} />}
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Calendar size={14} />
                    <Typography variant="span" className="text-xs">{stat.year}</Typography>
                  </div>
                </div>

                <Typography variant="p" className="text-sm font-bold text-cta uppercase tracking-widest mb-1">
                  {stat.unit}
                </Typography>
                <Typography variant="h2" className="text-primary mb-2">{stat.value}</Typography>
                <Typography variant="h3" className="text-secondary text-lg mb-4">{stat.category}</Typography>
                <Typography variant="p" className="text-sm text-slate-600 mb-6">
                  {stat.description}
                </Typography>
              </div>

            </article>
          ))}
        </div>
        </div>
      </div>
    </main>
  );
};
