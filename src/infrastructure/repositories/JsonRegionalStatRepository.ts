import { IRegionalStatRepository } from "@/domain/repositories/IRegionalStatRepository";
import { RegionalStat } from "@/domain/entities/RegionalStat";
import { BPSRepository } from "./BPSRepository";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src", "infrastructure", "data");
const DATA_FILE = path.join(DATA_DIR, "regional_stats.json");

interface RegionalStatsSchema {
  [region: string]: RegionalStat[];
}

export class JsonRegionalStatRepository implements IRegionalStatRepository {
  private mockRepo = new BPSRepository();

  private async ensureDataInitialized(): Promise<RegionalStatsSchema> {
    try {
      await mkdir(DATA_DIR, { recursive: true });
      const content = await readFile(DATA_FILE, "utf-8");
      return JSON.parse(content);
    } catch {
      // Default regions to initialize
      const defaultRegions = ["Indonesia", "Jawa Barat", "Jawa Timur", "Jawa Tengah", "Sumatera Utara", "Sulawesi Selatan"];
      const data: RegionalStatsSchema = {};
      
      for (const region of defaultRegions) {
        data[region] = await this.mockRepo.getStatsByRegion(region);
      }
      
      await writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
      return data;
    }
  }

  async getStatsByRegion(region: string): Promise<RegionalStat[]> {
    const data = await this.ensureDataInitialized();
    // If region doesn't exist, we can mock it on the fly and save it, or return a default
    if (!data[region]) {
      data[region] = await this.mockRepo.getStatsByRegion(region);
      await writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
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
    await writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  }

  async deleteStat(region: string, category: string): Promise<void> {
    const data = await this.ensureDataInitialized();
    if (data[region]) {
      data[region] = data[region].filter((s) => s.category !== category);
      await writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    }
  }
}
