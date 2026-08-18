import { ILandingRepository } from "@/domain/repositories/ILandingRepository";

export class GetLandingPageData {
  constructor(private landingRepository: ILandingRepository) {}

  async execute() {
    const [hero, visionMission, documents] = await Promise.all([
      this.landingRepository.getHeroContent(),
      this.landingRepository.getVisionMission(),
      this.landingRepository.getLatestDocuments(),
    ]);

    return {
      hero,
      visionMission,
      documents,
    };
  }
}
