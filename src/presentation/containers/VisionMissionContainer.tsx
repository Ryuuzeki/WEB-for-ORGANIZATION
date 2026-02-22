import React from "react";
import { VisionMission } from "@/domain/entities/VisionMission";
import { Typography } from "../components/ui/Typography";

interface VisionMissionContainerProps {
  data: VisionMission;
}

export const VisionMissionContainer: React.FC<VisionMissionContainerProps> = ({ data }) => {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-start">
      <div>
        <Typography variant="h2" className="text-primary mb-6">Visi Kami</Typography>
        <div className="p-8 bg-white rounded-2xl border-l-8 border-cta shadow-sm">
          <Typography variant="p" className="text-secondary italic text-xl">
            "{data.vision}"
          </Typography>
        </div>
      </div>
      <div>
        <Typography variant="h2" className="text-primary mb-6">Misi Kami</Typography>
        <ul className="space-y-4">
          {data.mission.map((m, i) => (
            <li key={i} className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-primary flex items-center justify-center font-bold">
                {i + 1}
              </span>
              <Typography variant="p" className="text-secondary">{m}</Typography>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
