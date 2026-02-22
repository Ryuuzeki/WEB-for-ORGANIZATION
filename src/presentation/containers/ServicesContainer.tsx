import React from "react";
import { Document } from "@/domain/entities/Document";
import { Typography } from "../components/ui/Typography";
import { FileText, Download } from "lucide-react";

interface ServicesContainerProps {
  documents: Document[];
}

export const ServicesContainer: React.FC<ServicesContainerProps> = ({ documents }) => {
  return (
    <section className="py-24 px-6 bg-cream/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <Typography variant="h2" className="text-primary mb-4">Pusat Dokumen & Regulasi</Typography>
            <Typography variant="p" className="text-secondary">
              Akses cepat ke standar operasional, modul akademik, dan regulasi konstruksi bangunan air terbaru.
            </Typography>
          </div>
          <button className="text-primary font-bold hover:underline">Lihat Semua Dokumen →</button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white p-6 rounded-xl border border-primary/10 hover:shadow-md transition-shadow flex items-start gap-4">
              <div className="p-3 rounded-lg bg-sky-100 text-primary">
                <FileText size={24} />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-cta uppercase tracking-wider">{doc.category}</span>
                <Typography variant="h3" className="text-primary mt-1 mb-4 text-lg">{doc.title}</Typography>
                <a
                  href={doc.downloadUrl}
                  className="inline-flex items-center gap-2 text-sm font-bold text-secondary hover:text-primary"
                >
                  <Download size={16} />
                  Unduh File
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
