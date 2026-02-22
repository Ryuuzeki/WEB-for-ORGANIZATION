import { ClimateData } from "../entities/ClimateData";

export interface IClimateRepository {
  getWeatherByRegion(region: string): Promise<ClimateData>;
}
