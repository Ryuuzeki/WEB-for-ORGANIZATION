"use client";

import { createContext, useContext, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import type { SiteContent } from "@/domain/entities/SiteContent";

const SiteContentContext = createContext<SiteContent | null>(null);

export function useSiteContent() {
  const content = useContext(SiteContentContext);
  if (!content) throw new Error("Konten website hanya tersedia pada halaman publik.");
  return content;
}

export function SiteShell({ children, siteContent }: { children: React.ReactNode; siteContent: SiteContent }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) return;

    const root = document.querySelector<HTMLElement>("[data-public-site-content]");
    if (!root) return;

    const titles = Array.from(
      root.querySelectorAll<HTMLElement>("h1:not([data-title-motion='off']), h2:not([data-title-motion='off']), h3:not([data-title-motion='off'])"),
    );
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    titles.forEach((title, index) => {
      title.classList.add("motion-title");
      if (title.tagName !== "H3") title.classList.add("motion-title-major");
      title.style.setProperty("--motion-title-delay", `${(index % 4) * 65}ms`);
      if (reduceMotion) title.classList.add("motion-title-visible");
    });

    if (reduceMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("motion-title-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
    );

    const frame = window.requestAnimationFrame(() => {
      titles.forEach((title) => observer.observe(title));
    });

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [isAdmin, pathname]);

  if (isAdmin) return <>{children}</>;

  const themeStyle = {
    "--hmtkba-navy": siteContent.theme.primary,
    "--hmtkba-deep-blue": siteContent.theme.secondary,
    "--hmtkba-sky-blue": siteContent.theme.accent,
    "--hmtkba-gold": siteContent.theme.cta,
    "--background": siteContent.theme.background,
    "--foreground": siteContent.theme.primary,
    "--hmtkba-cream": siteContent.theme.cream,
    "--hmtkba-footer": siteContent.theme.footer,
  } as React.CSSProperties;

  return (
    <SiteContentContext.Provider value={siteContent}>
      <div className="min-h-screen bg-background lg:flex" style={themeStyle}>
        <Sidebar content={siteContent.sidebar} />
        <div
          data-public-site-content
          className="min-w-0 flex-1 transition-[padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none lg:pl-[var(--sidebar-offset)]"
        >
          {children}
        </div>
      </div>
    </SiteContentContext.Provider>
  );
}
