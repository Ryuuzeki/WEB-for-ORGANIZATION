import Page from "@/presentation/app/dokumen/page";
import { listGalleryMedia } from "@/lib/galleryMediaRepository";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dokumentasi Kegiatan",
  description: "Jelajahi foto, video, kegiatan lapangan, proyek, dan prestasi mahasiswa HMTKBA.",
  alternates: { canonical: "/dokumen" },
  openGraph: {
    title: "Dokumentasi Kegiatan HMTKBA",
    description: "Galeri foto, video, kegiatan lapangan, proyek, dan prestasi mahasiswa HMTKBA.",
    url: "/dokumen",
  },
};

export default async function DocumentationPage() {
  const galleryMedia = await listGalleryMedia();
  return <Page initialMedia={galleryMedia} />;
}
