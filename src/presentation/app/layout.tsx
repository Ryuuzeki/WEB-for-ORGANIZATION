import type { Metadata } from "next";
import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/700.css";
import "@fontsource/montserrat/800.css";
import "@fontsource/montserrat/900.css";
import "../styles/globals.css";
import { SiteShell } from "../components/ui/SiteShell";
import { WaveLoadingScreen } from "../components/animations/WaveLoadingScreen";
import { getSiteContent } from "@/lib/siteContentRepository";

export const metadata: Metadata = {
  metadataBase: new URL("https://hmtkba.vercel.app"),
  title: {
    default: "HMTKBA | Himpunan Mahasiswa Teknologi Konstruksi Bangunan Air",
    template: "%s | HMTKBA",
  },
  description: "Website resmi HMTKBA—ruang informasi, pembelajaran, data keairan, dokumentasi kegiatan, dan kolaborasi mahasiswa Teknologi Konstruksi Bangunan Air.",
  applicationName: "HMTKBA",
  authors: [{ name: "HMTKBA" }],
  creator: "HMTKBA",
  publisher: "HMTKBA",
  category: "education",
  keywords: [
    "HMTKBA",
    "Himpunan Mahasiswa Teknologi Konstruksi Bangunan Air",
    "konstruksi bangunan air",
    "teknik sipil",
    "sumber daya air",
    "organisasi mahasiswa",
    "data keairan Indonesia",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "HMTKBA",
    title: "HMTKBA | Mengalir Kokoh, Berkarya untuk Negeri",
    description: "Ruang informasi, pembelajaran, data keairan, dan kolaborasi mahasiswa Teknologi Konstruksi Bangunan Air.",
  },
  twitter: {
    card: "summary_large_image",
    title: "HMTKBA | Mengalir Kokoh, Berkarya untuk Negeri",
    description: "Ruang informasi, pembelajaran, data keairan, dan kolaborasi mahasiswa Teknologi Konstruksi Bangunan Air.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteContent = await getSiteContent();

  return (
    <html lang="id" className="scroll-smooth">
      <body className="font-sans antialiased bg-background text-foreground">
        <WaveLoadingScreen />
        <SiteShell siteContent={siteContent}>{children}</SiteShell>
      </body>
    </html>
  );
}
