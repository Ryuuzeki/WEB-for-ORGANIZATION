"use client";

import React from "react";
import { Waves } from "lucide-react";
import BubbleMenu from "./BubbleMenu";

const hmtkbaMenuItems = [
  {
    label: "Visi Misi",
    href: "/#vision",
    ariaLabel: "Visi Misi",
    rotation: -6,
    hoverStyles: { bgColor: "#0f172a", textColor: "#ffffff" },
  },
  {
    label: "Data Center",
    href: "/data-center",
    ariaLabel: "Data Center",
    rotation: 6,
    hoverStyles: { bgColor: "#0284c7", textColor: "#ffffff" },
  },
  {
    label: "Dokumen",
    href: "/dokumen",
    ariaLabel: "Dokumen",
    rotation: -4,
    hoverStyles: { bgColor: "#0d9488", textColor: "#ffffff" },
  },
  {
    label: "Struktur",
    href: "/struktur-organisasi",
    ariaLabel: "Struktur Organisasi",
    rotation: 4,
    hoverStyles: { bgColor: "#2563eb", textColor: "#ffffff" },
  },
  {
    label: "Portal Admin",
    href: "/admin",
    ariaLabel: "Portal Admin",
    rotation: -6,
    hoverStyles: { bgColor: "#334155", textColor: "#ffffff" },
  },
  {
    label: "Kontak",
    href: "/#contact",
    ariaLabel: "Kontak",
    rotation: 6,
    hoverStyles: { bgColor: "#0369a1", textColor: "#ffffff" },
  },
];

export const Navbar: React.FC = () => {
  return (
    <BubbleMenu
      logo={
        <div className="flex items-center gap-2">
          <Waves className="h-6 w-6 text-[#0f172a]" />
          <span className="text-xl font-black tracking-tight text-[#0f172a]">
            HMTKBA
          </span>
        </div>
      }
      items={hmtkbaMenuItems}
      menuAriaLabel="Navigasi Utama"
      menuBg="#fbf7ee"
      menuContentColor="#0f172a"
      useFixedPosition={true}
      animationEase="back.out(1.5)"
      animationDuration={0.5}
      staggerDelay={0.1}
    />
  );
};
