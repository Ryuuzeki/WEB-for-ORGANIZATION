import React from "react";
import { VisionMission } from "@/domain/entities/VisionMission";

interface VisionMissionContainerProps {
  data: VisionMission;
}

export const VisionMissionContainer: React.FC<VisionMissionContainerProps> = ({ data }) => {
  return (
    <section className="px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto grid max-w-[1400px] items-start gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cta">Arah Organisasi</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-primary sm:text-5xl">{data.visionTitle || "Visi Kami"}</h2>
          <div className="relative mt-8 overflow-hidden rounded-[2rem] border border-primary/10 bg-white p-7 shadow-[0_20px_60px_rgba(16,42,107,.08)] sm:p-9">
            <div className="absolute inset-y-0 left-0 w-2 bg-gradient-to-b from-cta to-accent" />
            <p className="pl-2 text-base font-semibold italic leading-8 text-secondary sm:text-lg">
              &quot;{data.vision}&quot;
            </p>
          </div>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cta">Langkah Bersama</p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-primary sm:text-5xl">{data.missionTitle || "Misi Kami"}</h2>
          <ol className="mt-8 space-y-3">
            {data.mission.map((mission, index) => (
              <li key={`${index}-${mission}`} className="flex items-start gap-4 rounded-2xl border border-primary/8 bg-white/60 p-4 sm:p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent font-black text-primary">{index + 1}</span>
                <p className="pt-1 text-sm font-medium leading-7 text-secondary sm:text-base">{mission}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};
