import { ILandingRepository } from "@/domain/repositories/ILandingRepository";
import { HeroContent } from "@/domain/entities/HeroContent";
import { VisionMission } from "@/domain/entities/VisionMission";
import { Member } from "@/domain/entities/Member";
import { Document } from "@/domain/entities/Document";
import { MockLandingRepository } from "./MockLandingRepository";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src", "infrastructure", "data");
const DATA_FILE = path.join(DATA_DIR, "landing.json");

interface LandingDataSchema {
  hero: HeroContent;
  visionMission: VisionMission;
  documents: Document[];
  members: Member[];
}

export class JsonLandingRepository implements ILandingRepository {
  private mockRepo = new MockLandingRepository();

  private async ensureDataInitialized(): Promise<LandingDataSchema> {
    try {
      await mkdir(DATA_DIR, { recursive: true });
      const content = await readFile(DATA_FILE, "utf-8");
      return JSON.parse(content);
    } catch {
      // Initialize with mock data
      const hero = await this.mockRepo.getHeroContent();
      const visionMission = await this.mockRepo.getVisionMission();
      const documents = await this.mockRepo.getLatestDocuments();
      const members = await this.mockRepo.getOrganizationStructure();

      const data: LandingDataSchema = { hero, visionMission, documents, members };
      await writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
      return data;
    }
  }

  async getHeroContent(): Promise<HeroContent> {
    const data = await this.ensureDataInitialized();
    return data.hero;
  }

  async getVisionMission(): Promise<VisionMission> {
    const data = await this.ensureDataInitialized();
    return data.visionMission;
  }

  async getOrganizationStructure(): Promise<Member[]> {
    const data = await this.ensureDataInitialized();
    return data.members;
  }

  async getLatestDocuments(): Promise<Document[]> {
    const data = await this.ensureDataInitialized();
    return data.documents;
  }

  // Write operations
  async updateHeroContent(content: HeroContent): Promise<void> {
    const data = await this.ensureDataInitialized();
    data.hero = content;
    await writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  }

  async updateVisionMission(visionMission: VisionMission): Promise<void> {
    const data = await this.ensureDataInitialized();
    data.visionMission = visionMission;
    await writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  }

  async saveMember(member: Member): Promise<void> {
    const data = await this.ensureDataInitialized();
    const index = data.members.findIndex((m) => m.id === member.id);
    if (index >= 0) {
      data.members[index] = member;
    } else {
      data.members.push(member);
    }
    await writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  }

  async deleteMember(id: string): Promise<void> {
    const data = await this.ensureDataInitialized();
    data.members = data.members.filter((m) => m.id !== id);
    await writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  }

  async saveDocument(document: Document): Promise<void> {
    const data = await this.ensureDataInitialized();
    const index = data.documents.findIndex((d) => d.id === document.id);
    if (index >= 0) {
      data.documents[index] = document;
    } else {
      data.documents.push(document);
    }
    await writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  }

  async deleteDocument(id: string): Promise<void> {
    const data = await this.ensureDataInitialized();
    data.documents = data.documents.filter((d) => d.id !== id);
    await writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  }
}
