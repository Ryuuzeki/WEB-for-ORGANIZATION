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
import { useState } from "react";
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

export function Sidebar({
  content,
  collapsed,
  onCollapsedChange,
}: {
  content: SiteContent["sidebar"];
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarWidth = collapsed ? "88px" : "272px";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b border-primary/10 bg-background/90 px-4 shadow-sm backdrop-blur-xl lg:hidden">
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
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(272px,86vw)] flex-col overflow-x-hidden border-r border-white/10 bg-primary text-white shadow-2xl shadow-primary/15 transition-[width,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none lg:w-[var(--sidebar-width)] lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div
          className={`flex h-20 items-center border-b border-white/10 transition-[padding,gap] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
            collapsed ? "gap-0 px-5 lg:px-[22px]" : "gap-3 px-5"
          }`}
        >
          <Link
            href="/"
            className={`flex min-w-0 flex-1 items-center transition-[gap] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
              collapsed ? "gap-3 lg:gap-0" : "gap-3"
            }`}
            aria-label="HMTKBA Beranda"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white shadow-lg shadow-black/10">
              <Image src="/LOGO HIMA.png" alt="" width={44} height={44} className="h-full w-full object-contain" priority />
            </span>
            <span
              aria-hidden={collapsed}
              className={`min-w-0 overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-300 ease-out motion-reduce:transition-none ${
                collapsed
                  ? "max-w-52 opacity-100 lg:max-w-0 lg:-translate-x-2 lg:opacity-0"
                  : "max-w-52 translate-x-0 opacity-100 delay-150"
              }`}
            >
              <span className="block text-lg font-black tracking-tight">{content.brandTitle}</span>
              <span className="block truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-200">
                {content.brandSubtitle}
              </span>
            </span>
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

        <nav className="flex-1 overflow-x-hidden overflow-y-auto px-3 py-4" aria-label="Navigasi utama">
          <p
            aria-hidden={collapsed}
            className={`overflow-hidden whitespace-nowrap px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-sky-200/65 transition-[max-height,margin,opacity,transform] duration-300 ease-out motion-reduce:transition-none ${
              collapsed
                ? "mb-3 max-h-5 opacity-100 lg:mb-0 lg:max-h-0 lg:-translate-x-2 lg:opacity-0"
                : "mb-3 max-h-5 translate-x-0 opacity-100 delay-150"
            }`}
          >
            Navigasi
          </p>
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
                    className={`group flex min-h-11 items-center overflow-hidden rounded-2xl text-sm font-semibold transition-[padding,gap,color,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                      collapsed ? "gap-3 px-3 lg:gap-0 lg:px-[22px]" : "gap-3 px-3"
                    } ${
                      active ? "bg-white text-primary shadow-lg shadow-black/10" : "text-white/75 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon size={20} className="shrink-0" aria-hidden="true" />
                    <span
                      aria-hidden={collapsed}
                      className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-300 ease-out motion-reduce:transition-none ${
                        collapsed
                          ? "max-w-44 opacity-100 lg:max-w-0 lg:-translate-x-2 lg:opacity-0"
                          : "max-w-44 translate-x-0 opacity-100 delay-150"
                      }`}
                    >
                      {item.label}
                    </span>
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
            className={`flex min-h-12 items-center overflow-hidden rounded-2xl bg-white/8 text-sm font-semibold text-white/80 transition-[padding,gap,color,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none hover:bg-white/14 hover:text-white ${
              collapsed ? "gap-3 px-3 lg:gap-0 lg:px-[22px]" : "gap-3 px-3"
            }`}
          >
            <CircleUserRound size={20} className="shrink-0" aria-hidden="true" />
            <span
              aria-hidden={collapsed}
              className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-300 ease-out motion-reduce:transition-none ${
                collapsed
                  ? "max-w-44 opacity-100 lg:max-w-0 lg:-translate-x-2 lg:opacity-0"
                  : "max-w-44 translate-x-0 opacity-100 delay-150"
              }`}
            >
              <span className="block">{content.adminTitle}</span>
              <span className="block text-[10px] font-medium text-sky-200/65">{content.adminSubtitle}</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={() => onCollapsedChange(!collapsed)}
            className={`mt-3 hidden min-h-10 w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 text-xs font-semibold text-white/60 transition-[gap,color,background-color] duration-300 ease-out motion-reduce:transition-none hover:bg-white/10 hover:text-white lg:flex ${
              collapsed ? "gap-0" : "gap-2"
            }`}
            aria-label={collapsed ? "Perlebar sidebar" : "Perkecil sidebar"}
            aria-expanded={!collapsed}
          >
            <ChevronLeft
              className={`shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                collapsed ? "rotate-180" : ""
              }`}
              size={17}
            />
            <span
              aria-hidden={collapsed}
              className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-300 ease-out motion-reduce:transition-none ${
                collapsed ? "max-w-0 -translate-x-2 opacity-0" : "max-w-28 translate-x-0 opacity-100 delay-150"
              }`}
            >
              Perkecil menu
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
