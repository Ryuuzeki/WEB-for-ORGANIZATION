import { IRegionalStatRepository } from "@/domain/repositories/IRegionalStatRepository";
import { RegionalStat } from "@/domain/entities/RegionalStat";

export class BPSRepository implements IRegionalStatRepository {
  async getStatsByRegion(region: string): Promise<RegionalStat[]> {
    // Mocking BPS API structure (API Wilayah/Statistik)
    return [
      {
        category: "Ketersediaan Air Tanah",
        value: "85.4",
        unit: "Miliar m3/tahun",
        year: "2023",
        description: "Total potensi air tanah yang dapat diperbarui di wilayah " + region,
      },
      {
        category: "Indeks Kualitas Air",
        value: "54.2",
        unit: "Poin",
        year: "2023",
        description: "Parameter gabungan kualitas air sungai dan danau.",
      },
      {
        category: "Cakupan Layanan Irigasi",
        value: "72.1",
        unit: "%",
        year: "2023",
        description: "Persentase lahan pertanian yang teraliri sistem irigasi teknis.",
      }
    ];
  }

  async saveStat(region: string, category: string, stat: RegionalStat): Promise<void> {
    throw new Error("BPSRepository does not support writes");
  }

  async deleteStat(region: string, category: string): Promise<void> {
    throw new Error("BPSRepository does not support writes");
  }
}
