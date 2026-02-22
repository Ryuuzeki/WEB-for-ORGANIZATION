import React from "react";
import Link from "next/link";
import { Waves } from "lucide-react";

export const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/80 backdrop-blur-md border-b border-primary/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Waves className="text-primary" size={32} />
          <span className="font-extrabold text-2xl tracking-tighter text-primary">HMTKBA</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/#about" className="text-secondary font-medium hover:text-primary transition-colors">Tentang</Link>
          <Link href="/data-center" className="text-secondary font-medium hover:text-primary transition-colors">Data Center</Link>
          <Link href="/#docs" className="text-secondary font-medium hover:text-primary transition-colors">Dokumen</Link>
          <Link href="/#org" className="text-secondary font-medium hover:text-primary transition-colors">Organisasi</Link>
          <Link href="/#contact" className="bg-primary text-cream px-5 py-2 rounded-md font-bold hover:bg-secondary transition-colors">Kontak</Link>
        </div>
      </div>
    </nav>
  );
};
