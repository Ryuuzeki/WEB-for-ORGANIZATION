import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://hmtkba.vercel.app";
  return [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/teknologi-konstruksi-bangunan-air`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/dosen`, changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/data-center`, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/dokumen`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/struktur-organisasi`, changeFrequency: "monthly", priority: 0.7 },
  ];
}
