import React from "react";
import Image from "next/image";
import { Member } from "@/domain/entities/Member";
import { Typography } from "../components/ui/Typography";
import { Camera, UsersRound } from "lucide-react";

interface OrganizationContainerProps {
  members: Member[];
}

const getGroupedMembers = (members: Member[]) => {
  return members.reduce<Record<string, Member[]>>((groups, member) => {
    const division = member.division ?? "Pengurus";
    groups[division] = [...(groups[division] ?? []), member];
    return groups;
  }, {});
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

export const OrganizationContainer: React.FC<OrganizationContainerProps> = ({ members }) => {
  const groupedMembers = getGroupedMembers(members);
  const divisions = Object.entries(groupedMembers);

  return (
    <main className="min-h-screen px-6 pb-20 pt-28 lg:pt-16">
      <div className="max-w-7xl mx-auto">
        <section className="mb-12 border-b border-primary/10 pb-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <Typography variant="span" className="text-sm font-bold uppercase tracking-widest text-cta">
                HMTKBA 2024/2025
              </Typography>
              <Typography variant="h1" className="text-primary mt-3 mb-4">
                Struktur Organisasi
              </Typography>
              <Typography variant="p" className="text-secondary max-w-2xl">
                Susunan lengkap pengurus HMTKBA periode 2024/2025 berdasarkan divisi dan jabatan.
              </Typography>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-primary/10 bg-white px-5 py-4">
                <Typography variant="span" className="text-3xl font-extrabold text-primary">
                  {members.length}
                </Typography>
                <Typography variant="p" className="text-sm text-secondary">
                  Anggota
                </Typography>
              </div>
              <div className="rounded-lg border border-primary/10 bg-white px-5 py-4">
                <Typography variant="span" className="text-3xl font-extrabold text-primary">
                  {divisions.length}
                </Typography>
                <Typography variant="p" className="text-sm text-secondary">
                  Divisi
                </Typography>
              </div>
              <div className="rounded-lg border border-primary/10 bg-white px-5 py-4">
                <Typography variant="span" className="text-3xl font-extrabold text-primary">
                  {members.length}
                </Typography>
                <Typography variant="p" className="text-sm text-secondary">
                  Foto
                </Typography>
              </div>
            </div>
          </div>
        </section>

        <div className="space-y-14">
          {divisions.map(([division, divisionMembers]) => (
            <section key={division}>
              <div className="mb-5 flex flex-col gap-2 border-l-4 border-cta pl-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Typography variant="h2" className="text-2xl text-primary md:text-3xl">
                    {division}
                  </Typography>
                  <Typography variant="p" className="text-sm text-secondary">
                    {divisionMembers.length} anggota
                  </Typography>
                </div>

                <div className="flex items-center gap-2 text-secondary">
                  <UsersRound size={18} />
                  <Typography variant="span" className="text-sm font-semibold">
                    Periode 2024/2025
                  </Typography>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
                {divisionMembers.map((member) => (
                  <article
                    key={member.id}
                    className="group rounded-lg border border-primary/10 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:border-accent/50 hover:shadow-md"
                  >
                    <div className={`relative mb-3 aspect-[4/5] overflow-hidden rounded-md bg-sky-100 ${member.imageUrl ? "photo-frame" : ""}`}>
                      {member.imageUrl ? (
                        <Image
                          src={member.imageUrl}
                          alt={`Foto ${member.name}`}
                          fill
                          sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                          className="object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-sky-100 via-white to-cream text-primary">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-extrabold text-cream">
                            {getInitials(member.name)}
                          </div>
                          <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-secondary/70">
                            <Camera size={14} />
                            Foto {member.id}
                          </div>
                        </div>
                      )}
                    </div>

                    <Typography variant="h3" className="truncate text-base text-primary md:text-base">
                      {member.name}
                    </Typography>
                    <Typography variant="p" className="mt-1 min-h-10 text-sm leading-snug text-secondary">
                      {member.role}
                    </Typography>
                    <Typography variant="span" className="mt-2 block text-xs font-semibold text-cta">
                      {member.period}
                    </Typography>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
};
