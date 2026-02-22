import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "../styles/globals.css";
import { Navbar } from "../components/ui/Navbar";
import { WaveLoadingScreen } from "../components/animations/WaveLoadingScreen";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "HMTKBA - Himpunan Mahasiswa Teknologi Konstruksi Bangunan Air",
  description: "Website resmi Himpunan Mahasiswa Teknologi Konstruksi Bangunan Air",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body
        className={`${montserrat.variable} font-sans antialiased bg-background text-foreground`}
      >
        <WaveLoadingScreen />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
