import { ILandingRepository } from "@/domain/repositories/ILandingRepository";
import { HeroContent } from "@/domain/entities/HeroContent";
import { VisionMission } from "@/domain/entities/VisionMission";
import { Member } from "@/domain/entities/Member";
import { Document } from "@/domain/entities/Document";

export class MockLandingRepository implements ILandingRepository {
  async getHeroContent(): Promise<HeroContent> {
    return {
      title: "Konstruksi Masa Depan, Ketahanan Air untuk Negeri",
      subtitle: "Himpunan Mahasiswa Teknologi Konstruksi Bangunan Air - Mengalir Kokoh Menuju Inovasi.",
      ctaText: "Jelajahi Program Kami",
    };
  }

  async getVisionMission(): Promise<VisionMission> {
    return {
      vision: "Menjadi wadah pengembangan mahasiswa Teknik Konstruksi Bangunan Air yang unggul, berintegritas, dan inovatif dalam pengelolaan sumber daya air.",
      mission: [
        "Meningkatkan kualitas akademik dan soft skill mahasiswa.",
        "Membangun sinergi antar elemen dalam program studi.",
        "Berkontribusi nyata dalam pengabdian masyarakat di bidang keairan."
      ],
    };
  }

  async getOrganizationStructure(): Promise<Member[]> {
    return [
      { id: "1", name: "Ketua Himpunan", role: "Ketua", period: "2024/2025" },
      { id: "2", name: "Wakil Ketua", role: "Wakil Ketua", period: "2024/2025" },
    ];
  }

  async getLatestDocuments(): Promise<Document[]> {
    return [
      { id: "1", title: "Standar Irigasi KP-01", category: "Regulasi", downloadUrl: "#" },
      { id: "2", title: "Modul Hidrolika Terapan", category: "Akademik", downloadUrl: "#" },
    ];
  }
}
