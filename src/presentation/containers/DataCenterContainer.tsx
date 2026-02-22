import React from "react";
import { Typography } from "../components/ui/Typography";
import { Button } from "../components/ui/Button";
import {
  Cloud,
  Droplets,
  Thermometer,
  Wind,
  BarChart3,
  Cpu,
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
    <main className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="mb-12">
        <Typography variant="h1" className="text-primary mb-4">Data Center HMTKBA</Typography>
        <Typography variant="p" className="text-secondary">
          Monitor real-time kondisi klimatologi dan statistik infrastruktur air nasional.
        </Typography>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Climate Card */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-primary/5 overflow-hidden">
          <div className="bg-primary p-6 text-cream">
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h3">Cuaca Saat Ini</Typography>
              <Cloud size={24} className="text-accent" />
            </div>
            <Typography variant="p" className="text-sm opacity-80">{climate.region}</Typography>
          </div>

          <div className="p-6">
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
              <div className="flex items-center gap-2 p-3 bg-cream rounded-lg">
                <Droplets className="text-accent" size={18} />
                <Typography variant="span" className="text-sm font-medium">{climate.humidity}</Typography>
              </div>
              <div className="flex items-center gap-2 p-3 bg-cream rounded-lg">
                <Wind className="text-secondary" size={18} />
                <Typography variant="span" className="text-sm font-medium">{climate.windSpeed}</Typography>
              </div>
            </div>

            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <Cpu size={16} />
              Analisis dengan AI
            </Button>
            <Typography variant="p" className="text-[10px] text-slate-400 mt-4 text-center">
              Sumber: BMKG | Update: {new Date(climate.lastUpdated).toLocaleString('id-ID')}
            </Typography>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-primary/5 flex flex-col justify-between">
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

              <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                <Cpu size={16} />
                Analisis dengan AI
              </Button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};
