"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background lg:flex">
      <Sidebar />
      <div className="min-w-0 flex-1 lg:pl-[var(--sidebar-offset)]">
        {children}
      </div>
    </div>
  );
}
