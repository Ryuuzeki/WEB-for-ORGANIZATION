import React from "react";
import { Document } from "@/domain/entities/Document";
import { ArrowRight, Download, FileText } from "lucide-react";
import Link from "next/link";
import type { HomeDocumentsContent } from "@/domain/entities/SiteContent";

interface ServicesContainerProps {
  documents: Document[];
  content?: HomeDocumentsContent;
}

export const ServicesContainer: React.FC<ServicesContainerProps> = ({ documents, content }) => {
  return (
    <section className="bg-cream/50 px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end lg:mb-12">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cta">Dokumentasi & Referensi</p>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-primary sm:text-5xl">{content?.title || "Pusat Dokumen & Regulasi"}</h2>
            <p className="mt-5 text-sm font-medium leading-7 text-secondary/70 sm:text-base">{content?.description || "Akses cepat ke standar operasional, modul akademik, dan regulasi konstruksi bangunan air terbaru."}</p>
          </div>
          <Link href="/dokumen" className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/12 bg-white px-5 py-3 text-xs font-black text-primary transition hover:-translate-y-0.5 hover:border-cta">{content?.buttonText || "Lihat Semua Dokumentasi"} <ArrowRight size={15} /></Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <article key={doc.id} className="group flex min-h-52 flex-col rounded-[1.75rem] border border-primary/9 bg-white p-6 shadow-[0_16px_45px_rgba(16,42,107,.06)] transition hover:-translate-y-1 hover:border-cta/45 hover:shadow-[0_22px_60px_rgba(16,42,107,.1)]">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-100 text-primary">
                <FileText size={24} />
              </div>
              <div className="mt-6 flex flex-1 flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-cta">{doc.category}</span>
                <h3 className="mt-2 text-lg font-black leading-snug text-primary">{doc.title}</h3>
                <a
                  href={doc.downloadUrl}
                  className="mt-auto inline-flex items-center gap-2 pt-6 text-xs font-black text-secondary transition group-hover:text-primary"
                >
                  <Download size={16} />
                  {content?.downloadText || "Unduh File"}
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
