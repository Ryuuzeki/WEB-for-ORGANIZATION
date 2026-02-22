import { RegionalStat } from "../entities/RegionalStat";

export interface IRegionalStatRepository {
  getStatsByRegion(region: string): Promise<RegionalStat[]>;
}
