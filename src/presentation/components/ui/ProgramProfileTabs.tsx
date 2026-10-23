"use client";

import { useState } from "react";
import { Award, CheckCircle2, Eye, Lightbulb, Target } from "lucide-react";

const tabs = [
  {
    id: "visi",
    label: "Visi Program Studi",
    icon: Eye,
    title: "Program vokasi unggulan bidang sumber daya air",
    body: "Menjadi program studi unggulan yang menghasilkan sumber daya manusia bidang sumber daya air yang kompeten, profesional, berdaya saing tinggi, dan siap kerja.",
  },
  {
    id: "keilmuan",
    label: "Visi Keilmuan",
    icon: Lightbulb,
    title: "Keilmuan terapan yang dekat dengan kebutuhan lapangan",
    body: "Mengembangkan kompetensi konstruksi sumber daya air melalui pembelajaran vokasi, penerapan teknologi mutakhir, serta prinsip keamanan, kesehatan, keselamatan, dan keberlanjutan.",
  },
  {
    id: "misi",
    label: "Misi",
    icon: CheckCircle2,
    title: "Pembelajaran, riset, dan kolaborasi",
    bullets: [
      "Menyelenggarakan pembelajaran aplikatif yang mengikuti perkembangan industri konstruksi.",
      "Mengembangkan penelitian yang memperkuat pembelajaran dan kemajuan ilmu sumber daya air.",
      "Melaksanakan pengabdian masyarakat serta membangun kerja sama dengan para pemangku kepentingan.",
      "Menjalankan tata kelola pendidikan yang transparan, partisipatif, akuntabel, dan berorientasi mutu.",
    ],
  },
  {
    id: "tujuan",
    label: "Tujuan",
    icon: Target,
    title: "Lulusan kompeten dan siap berkarya",
    bullets: [
      "Menghasilkan ahli madya sumber daya air yang kompeten dan siap kerja.",
      "Menghasilkan penelitian terapan yang relevan dengan teknologi konstruksi.",
      "Menghadirkan program pengabdian masyarakat yang bermanfaat dan berdaya guna.",
      "Memperluas kerja sama untuk mendukung pendidikan dan pengembangan program studi.",
    ],
  },
  {
    id: "akreditasi",
    label: "Akreditasi",
    icon: Award,
    title: "Terakreditasi Baik Sekali",
    body: "Status akreditasi Program Studi Teknologi Konstruksi Bangunan Air ditetapkan melalui Keputusan LAM Teknik No. 0412/SK/LAM Teknik/VD3/VIII/2024.",
  },
];

export default function ProgramProfileTabs() {
  const [activeId, setActiveId] = useState(tabs[0].id);
  const activeTab = tabs.find((tab) => tab.id === activeId) ?? tabs[0];
  const ActiveIcon = activeTab.icon;

  return (
    <div className="overflow-hidden rounded-[2rem] border border-primary/10 bg-white shadow-[0_24px_70px_rgba(16,42,107,0.1)]">
      <div className="grid lg:grid-cols-[340px_1fr]">
        <div className="bg-primary p-4 sm:p-6" role="tablist" aria-label="Profil program studi">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeId;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`profile-panel-${tab.id}`}
                onClick={() => setActiveId(tab.id)}
                className={`mb-2 flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left text-sm font-bold transition ${
                  isActive ? "bg-cream text-primary shadow-lg" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${isActive ? "bg-cta/20 text-cta" : "bg-white/10"}`}>
                  <Icon size={18} aria-hidden="true" />
                </span>
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          id={`profile-panel-${activeTab.id}`}
          role="tabpanel"
          className="relative min-h-[390px] overflow-hidden p-7 sm:p-10 lg:p-14"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border-[38px] border-primary/[0.035]" />
          <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-cream text-primary">
            <ActiveIcon size={25} aria-hidden="true" />
          </span>
          <p className="relative mt-7 text-xs font-black uppercase tracking-[0.2em] text-cta">Profil & Akreditasi</p>
          <h3 key={`${activeTab.id}-title`} className="relative mt-3 max-w-2xl text-2xl font-black leading-tight text-primary sm:text-4xl animate-fade-in">
            {activeTab.title}
          </h3>
          {activeTab.body && (
            <p key={`${activeTab.id}-body`} className="relative mt-6 max-w-3xl text-sm font-medium leading-7 text-secondary/75 sm:text-base animate-fade-in">
              {activeTab.body}
            </p>
          )}
          {activeTab.bullets && (
            <ul key={`${activeTab.id}-list`} className="relative mt-6 grid gap-3 animate-fade-in">
              {activeTab.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 rounded-2xl border border-primary/8 bg-background/65 p-4 text-sm font-medium leading-6 text-secondary/75">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-cta" aria-hidden="true" />
                  {bullet}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
