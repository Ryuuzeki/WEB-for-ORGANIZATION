import { RegionalStat } from "../entities/RegionalStat";

export interface IRegionalStatRepository {
  getStatsByRegion(region: string): Promise<RegionalStat[]>;
  saveStat(region: string, category: string, stat: RegionalStat): Promise<void>;
  deleteStat(region: string, category: string): Promise<void>;
}
