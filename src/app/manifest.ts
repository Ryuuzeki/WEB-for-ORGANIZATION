import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HMTKBA—Himpunan Mahasiswa Teknologi Konstruksi Bangunan Air",
    short_name: "HMTKBA",
    description: "Ruang informasi dan kolaborasi mahasiswa Teknologi Konstruksi Bangunan Air.",
    start_url: "/",
    display: "standalone",
    background_color: "#FCEDD3",
    theme_color: "#102A6B",
    lang: "id",
  };
}
