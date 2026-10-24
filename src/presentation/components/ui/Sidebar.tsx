"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BriefcaseBusiness,
  BookOpenText,
  ChevronLeft,
  CircleUserRound,
  Home,
  Landmark,
  Medal,
  Menu,
  Network,
  Trophy,
  UsersRound,
  Waves,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { SiteContent } from "@/domain/entities/SiteContent";

const navigation = [
  { label: "Beranda", href: "/", icon: Home },
  { label: "Profil Prodi", href: "/teknologi-konstruksi-bangunan-air", icon: Landmark },
  { label: "Dosen TKBA", href: "/dosen", icon: UsersRound },
  { label: "Prestasi", href: "/prestasi", icon: Trophy },
  { label: "Portal Lomba", href: "/portal-lomba", icon: Medal },
  { label: "Tentang Kami", href: "/#about", icon: BookOpenText },
  { label: "Struktur", href: "/#struktur", icon: Network },
  { label: "Program Kerja", href: "/#program", icon: BriefcaseBusiness },
  { label: "Dokumentasi", href: "/dokumen", icon: Waves },
  { label: "Data Center", href: "/data-center", icon: BarChart3 },
];

export function Sidebar({ content }: { content: SiteContent["sidebar"] }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarWidth = collapsed ? "88px" : "272px";

  useEffect(() => {
    document.documentElement.style.setProperty("--sidebar-offset", sidebarWidth);
    return () => {
      document.documentElement.style.removeProperty("--sidebar-offset");
    };
  }, [sidebarWidth]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-primary/10 bg-[#fbf7ee]/90 px-4 backdrop-blur-xl lg:hidden">
        <Link href="/" className="flex items-center gap-2" aria-label="HMTKBA Beranda">
          <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-white shadow-sm">
            <Image src="/LOGO HIMA.png" alt="" width={36} height={36} className="h-full w-full object-contain" />
          </span>
          <span className="font-extrabold tracking-tight text-primary">{content.brandTitle}</span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-primary/10 bg-white text-primary shadow-sm"
          aria-label="Buka navigasi"
          aria-expanded={mobileOpen}
        >
          <Menu size={20} />
        </button>
      </header>

      {mobileOpen && (
        <button
          className="fixed inset-0 z-40 bg-[#081a3d]/45 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Tutup navigasi"
        />
      )}

      <aside
        style={{ "--sidebar-width": sidebarWidth } as React.CSSProperties}
        className={`fixed inset-y-0 left-0 z-50 flex w-[var(--sidebar-width)] flex-col border-r border-white/10 bg-primary text-white shadow-2xl shadow-primary/15 transition-[width,transform] duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
          <Link href="/" className="flex min-w-0 flex-1 items-center gap-3" aria-label="HMTKBA Beranda">
            <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white shadow-lg shadow-black/10">
              <Image src="/LOGO HIMA.png" alt="" width={44} height={44} className="h-full w-full object-contain" priority />
            </span>
            {!collapsed && (
              <span className="min-w-0">
                <span className="block text-lg font-black tracking-tight">{content.brandTitle}</span>
                <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-200">
                  {content.brandSubtitle}
                </span>
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Tutup navigasi"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Navigasi utama">
          {!collapsed && <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-sky-200/65">Navigasi</p>}
          <ul className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = item.href.includes("#")
                ? false
                : item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.label : undefined}
                    className={`group flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition-colors ${
                      active ? "bg-white text-primary shadow-lg shadow-black/10" : "text-white/75 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon size={20} className="shrink-0" aria-hidden="true" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-white/10 p-3">
          <Link
            href="/admin/login"
            title={collapsed ? content.adminTitle : undefined}
            className="flex min-h-12 items-center gap-3 rounded-2xl bg-white/8 px-3 text-sm font-semibold text-white/80 transition hover:bg-white/14 hover:text-white"
          >
            <CircleUserRound size={20} className="shrink-0" aria-hidden="true" />
            {!collapsed && (
              <span>
                <span className="block">{content.adminTitle}</span>
                <span className="block text-[10px] font-medium text-sky-200/65">{content.adminSubtitle}</span>
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="mt-3 hidden min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 text-xs font-semibold text-white/60 hover:bg-white/10 hover:text-white lg:flex"
            aria-label={collapsed ? "Perlebar sidebar" : "Perkecil sidebar"}
          >
            <ChevronLeft className={`transition-transform ${collapsed ? "rotate-180" : ""}`} size={17} />
            {!collapsed && <span>Perkecil menu</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
