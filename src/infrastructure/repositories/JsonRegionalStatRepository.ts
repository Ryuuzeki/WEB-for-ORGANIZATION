import { IRegionalStatRepository } from "@/domain/repositories/IRegionalStatRepository";
import { RegionalStat } from "@/domain/entities/RegionalStat";
import { BPSRepository } from "./BPSRepository";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import regionalStatsSeed from "../data/regional_stats.json";
import { get, put } from "@vercel/blob";

const DATA_DIR = path.join(process.cwd(), "src", "infrastructure", "data");
const DATA_FILE = path.join(DATA_DIR, "regional_stats.json");
const BLOB_DATA_PATH = "hmtkba/data/regional-stats.json";

interface RegionalStatsSchema {
  [region: string]: RegionalStat[];
}

let memoryData: RegionalStatsSchema | null = null;
const hasBlobStorage = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

const cloneSeedData = (): RegionalStatsSchema =>
  JSON.parse(JSON.stringify(regionalStatsSeed)) as RegionalStatsSchema;

export class JsonRegionalStatRepository implements IRegionalStatRepository {
  private mockRepo = new BPSRepository();

  private async ensureDataInitialized(): Promise<RegionalStatsSchema> {
    if (hasBlobStorage()) {
      try {
        const result = await get(BLOB_DATA_PATH, { access: "public", useCache: false });
        if (result?.stream) {
          const parsed = (await new Response(result.stream).json()) as RegionalStatsSchema;
          memoryData = parsed;
          return parsed;
        }
      } catch {
        // Use the bundled seed until Superadmin saves the first change.
      }
      memoryData = cloneSeedData();
      return memoryData;
    }

    if (memoryData) return memoryData;

    try {
      const content = await readFile(DATA_FILE, "utf-8");
      memoryData = JSON.parse(content) as RegionalStatsSchema;
    } catch {
      memoryData = cloneSeedData();
    }

    return memoryData;
  }

  private async persist(data: RegionalStatsSchema): Promise<void> {
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
      // Keep serving the in-memory copy when the runtime filesystem is read-only.
    }
  }

  async getStatsByRegion(region: string): Promise<RegionalStat[]> {
    const data = await this.ensureDataInitialized();
    // If region doesn't exist, we can mock it on the fly and save it, or return a default
    if (!data[region]) {
      data[region] = await this.mockRepo.getStatsByRegion(region);
      await this.persist(data);
    }
    return data[region];
  }

  // Write operations
  async saveStat(region: string, category: string, stat: RegionalStat): Promise<void> {
    const data = await this.ensureDataInitialized();
    if (!data[region]) {
      data[region] = [];
    }
    const index = data[region].findIndex((s) => s.category === category);
    if (index >= 0) {
      data[region][index] = stat;
    } else {
      data[region].push(stat);
    }
    await this.persist(data);
  }

  async deleteStat(region: string, category: string): Promise<void> {
    const data = await this.ensureDataInitialized();
    if (data[region]) {
      data[region] = data[region].filter((s) => s.category !== category);
      await this.persist(data);
    }
  }
}
