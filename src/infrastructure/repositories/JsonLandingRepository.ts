import { ILandingRepository } from "@/domain/repositories/ILandingRepository";
import { HeroContent } from "@/domain/entities/HeroContent";
import { VisionMission } from "@/domain/entities/VisionMission";
import { Member } from "@/domain/entities/Member";
import { Document } from "@/domain/entities/Document";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { get, put } from "@vercel/blob";
import landingSeed from "../data/landing.json";

const DATA_DIR = path.join(process.cwd(), "src", "infrastructure", "data");
const DATA_FILE = path.join(DATA_DIR, "landing.json");
const BLOB_DATA_PATH = "hmtkba/data/landing.json";

interface LandingDataSchema {
  hero: HeroContent;
  visionMission: VisionMission;
  documents: Document[];
  members: Member[];
}

let memoryData: LandingDataSchema | null = null;
const hasBlobStorage = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

const cloneSeedData = (): LandingDataSchema =>
  JSON.parse(JSON.stringify(landingSeed)) as LandingDataSchema;

export class JsonLandingRepository implements ILandingRepository {
  private async ensureDataInitialized(): Promise<LandingDataSchema> {
    if (hasBlobStorage()) {
      try {
        const result = await get(BLOB_DATA_PATH, { access: "public", useCache: false });
        if (result?.stream) {
          const parsed = (await new Response(result.stream).json()) as LandingDataSchema;
          memoryData = parsed;
          return parsed;
        }
      } catch {
        // The bundled seed remains the first-run source until an admin saves.
      }
      memoryData = cloneSeedData();
      return memoryData;
    }

    if (memoryData) return memoryData;

    try {
      const content = await readFile(DATA_FILE, "utf-8");
      memoryData = JSON.parse(content) as LandingDataSchema;
    } catch {
      // Cloudflare Workers exposes a read-only bundle. The imported JSON keeps
      // the public site available there while local development can use files.
      memoryData = cloneSeedData();
    }

    return memoryData;
  }

  private async persist(data: LandingDataSchema): Promise<void> {
    memoryData = data;
    if (hasBlobStorage()) {
      await put(BLOB_DATA_PATH, JSON.stringify(data), {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: 30,
        contentType: "application/json; charset=utf-8",
      });
      return;
    }

    try {
      await mkdir(DATA_DIR, { recursive: true });
      await writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch {
      // The in-memory copy remains usable in read-only serverless runtimes.
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
    await this.persist(data);
  }

  async updateVisionMission(visionMission: VisionMission): Promise<void> {
    const data = await this.ensureDataInitialized();
    data.visionMission = visionMission;
    await this.persist(data);
  }

  async saveMember(member: Member): Promise<void> {
    const data = await this.ensureDataInitialized();
    const index = data.members.findIndex((m) => m.id === member.id);
    if (index >= 0) {
      data.members[index] = member;
    } else {
      data.members.push(member);
    }
    await this.persist(data);
  }

  async deleteMember(id: string): Promise<void> {
    const data = await this.ensureDataInitialized();
    data.members = data.members.filter((m) => m.id !== id);
    await this.persist(data);
  }

  async saveDocument(document: Document): Promise<void> {
    const data = await this.ensureDataInitialized();
    const index = data.documents.findIndex((d) => d.id === document.id);
    if (index >= 0) {
      data.documents[index] = document;
    } else {
      data.documents.push(document);
    }
    await this.persist(data);
  }

  async deleteDocument(id: string): Promise<void> {
    const data = await this.ensureDataInitialized();
    data.documents = data.documents.filter((d) => d.id !== id);
    await this.persist(data);
  }
}
