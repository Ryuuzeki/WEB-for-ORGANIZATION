import { ILandingRepository } from "@/domain/repositories/ILandingRepository";
import { HeroContent } from "@/domain/entities/HeroContent";
import { VisionMission } from "@/domain/entities/VisionMission";
import { Member } from "@/domain/entities/Member";
import { Document } from "@/domain/entities/Document";

const createDivisionMembers = (
  division: string,
  roles: string[],
  startIndex: number,
  names: string[] = []
): Member[] => {
  return roles.map((role, index) => {
    const memberNumber = startIndex + index;

    return {
      id: memberNumber.toString().padStart(2, "0"),
      name: names[index] ?? `Anggota ${memberNumber.toString().padStart(2, "0")}`,
      role,
      division,
      period: "2024/2025",
    };
  });
};

const createDivisionRoles = (division: string, memberCount: number): string[] => {
  return [
    `Kepala Divisi ${division}`,
    ...Array.from({ length: memberCount - 1 }, (_, index) => {
      return `Anggota ${division} ${(index + 1).toString().padStart(2, "0")}`;
    }),
  ];
};

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
    const divisions = [
      {
        name: "BPH (Badan Pengurus Harian)",
        roles: [
          "Ketua Umum",
          "Wakil Ketua Umum",
          "Sekretaris Umum",
          "Bendahara Umum",
        ],
        names: [
          "Achsanul Chuluqy",
          "Gardaneko Rachmadesyura",
          "Rahma Fauziah",
          "Trisna Anindya",
        ],
      },
      {
        name: "Sekretariat Kabinet",
        roles: createDivisionRoles("Sekretariat Kabinet", 13),
        names: [
          "Keila Raesya",
          "Arkananta ayu",
          "Naila Putri",
          "Risydin Mufardis",
          "Dimas Ilham",
          "Indra Dwi",
          "Dian Ivana",
          "Adinda Embun",
          "Nabila Defina",
          "Dida Binsar",
          "Raykhan Tanaka",
          "Nabila Az-Zhahirah",
          "Herniani Dwi",
        ],
      },
      {
        name: "Akademik Mahasiswa",
        roles: createDivisionRoles("Akademik Mahasiswa", 15),
        names: [
          "Aqsha Rizad",
          "Bintang Ali Yafi",
          "Ibrahim Yahya",
          "Defa Rifqi",
          "Natasya Dhefaniar",
          "Putri Sabrina",
          "Aura Ramadhani",
          "Sutra Virzi",
          "Panggih Tri",
          "Raffi Arkha",
          "Ahmad Zakaria",
          "Nabila Purnamasari",
          "Jasmin Tsarwah",
          "Siti Nurhafizha",
          "Tanisah Naura",
        ],
      },
      {
        name: "Minat dan Bakat",
        roles: createDivisionRoles("Minat dan Bakat", 13),
        names: [
          "Rizky Anugerah",
          "Betrik Rosinta",
          "Aisya Aulia",
          "Azzahra Qurrota",
          "Verdinan Krisna",
          "Adi Guna",
          "Matthew Steven",
          "Fatihah Surya",
          "Raisya Anindya",
          "Wilgesi Bianglala",
          "Dewa Tora",
          "Alfaizi Ramadhani",
          "Khayla Natasya",
        ],
      },
      {
        name: "Ekonomi Kreatif",
        roles: createDivisionRoles("Ekonomi Kreatif", 12),
        names: [
          "Stevheen Febryanto",
          "Dimitry Rizky",
          "Alysia Fadhilah",
          "Bunga Asya",
          "Gresta Aulia",
          "Putri Ananta",
          "Sanie Aditya",
          "Silviana Aura",
          "Mulia Aristawidya",
          "Anita Mirandani",
          "Edric Ayman",
          "Alya Khanza",
        ],
      },
      {
        name: "Komunikasi dan Publikasi",
        roles: createDivisionRoles("Komunikasi dan Publikasi", 14),
        names: [
          "Fikka Liurensa",
          "Darus Salam M",
          "Zahiya Aqila Putri",
          "Nayla Farikha Khansa",
          "Dimas Fikhri",
          "Muhammad Hafidz",
          "Noval Khalid",
          "Immanuel Silwanus",
          "Nabila Eka Metrike",
          "Bayu Rahmad",
          "Adeline Charilene",
          "Wiji Ginanjar",
          "Fahrani Regina",
          "Nasywa Adzki",
        ],
      },
    ];

    return divisions.flatMap((division, divisionIndex) => {
      const startIndex = divisions
        .slice(0, divisionIndex)
        .reduce((total, current) => total + current.roles.length, 1);

      return createDivisionMembers(division.name, division.roles, startIndex, division.names);
    });
  }

  async getLatestDocuments(): Promise<Document[]> {
    return [
      { id: "1", title: "Standar Irigasi KP-01", category: "Regulasi", downloadUrl: "#" },
      { id: "2", title: "Modul Hidrolika Terapan", category: "Akademik", downloadUrl: "#" },
    ];
  }

  async updateHeroContent(content: HeroContent): Promise<void> {
    throw new Error("MockLandingRepository does not support writes");
  }

  async updateVisionMission(visionMission: VisionMission): Promise<void> {
    throw new Error("MockLandingRepository does not support writes");
  }

  async saveMember(member: Member): Promise<void> {
    throw new Error("MockLandingRepository does not support writes");
  }

  async deleteMember(id: string): Promise<void> {
    throw new Error("MockLandingRepository does not support writes");
  }

  async saveDocument(document: Document): Promise<void> {
    throw new Error("MockLandingRepository does not support writes");
  }

  async deleteDocument(id: string): Promise<void> {
    throw new Error("MockLandingRepository does not support writes");
  }
}
