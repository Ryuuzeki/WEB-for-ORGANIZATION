import { IClimateRepository } from "@/domain/repositories/IClimateRepository";
import { IRegionalStatRepository } from "@/domain/repositories/IRegionalStatRepository";

export class GetRegionalAnalysis {
  constructor(
    private climateRepo: IClimateRepository,
    private statRepo: IRegionalStatRepository
  ) {}

  async execute(region: string) {
    const [climate, stats] = await Promise.all([
      this.climateRepo.getWeatherByRegion(region),
      this.statRepo.getStatsByRegion(region),
    ]);

    return {
      climate,
      stats,
      generatedAt: new Date().toISOString(),
    };
  }
}
