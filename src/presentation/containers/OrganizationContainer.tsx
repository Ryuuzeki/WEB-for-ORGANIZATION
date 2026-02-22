import React from "react";
import { Member } from "@/domain/entities/Member";
import { Typography } from "../components/ui/Typography";
import { User } from "lucide-react";

interface OrganizationContainerProps {
  members: Member[];
}

export const OrganizationContainer: React.FC<OrganizationContainerProps> = ({ members }) => {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <Typography variant="h2" className="text-primary mb-4">Struktur Organisasi</Typography>
        <Typography variant="p" className="text-secondary max-w-2xl mx-auto">
          Mengenal para pemimpin di balik HMTKBA yang berdedikasi untuk kemajuan mahasiswa dan teknologi air.
        </Typography>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {members.map((member) => (
          <div key={member.id} className="text-center group">
            <div className="aspect-square rounded-2xl bg-slate-200 mb-4 flex items-center justify-center text-slate-400 overflow-hidden relative">
              <User size={64} />
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <Typography variant="h3" className="text-primary text-lg">{member.name}</Typography>
            <Typography variant="p" className="text-cta font-medium text-sm">{member.role}</Typography>
            <Typography variant="span" className="text-xs text-slate-500">{member.period}</Typography>
          </div>
        ))}
      </div>
    </section>
  );
};
