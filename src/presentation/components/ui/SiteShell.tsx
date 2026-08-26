"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

export function SiteShell({ children }: { children: React.ReactNode }) {
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

  return (
    <div className="min-h-screen bg-background lg:flex">
      <Sidebar />
      <div data-public-site-content className="min-w-0 flex-1 lg:pl-[var(--sidebar-offset)]">
        {children}
      </div>
    </div>
  );
}
