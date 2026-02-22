import { ILandingRepository } from "@/domain/repositories/ILandingRepository";

export class GetLandingPageData {
  constructor(private landingRepository: ILandingRepository) {}

  async execute() {
    const [hero, visionMission, organization, documents] = await Promise.all([
      this.landingRepository.getHeroContent(),
      this.landingRepository.getVisionMission(),
      this.landingRepository.getOrganizationStructure(),
      this.landingRepository.getLatestDocuments(),
    ]);

    return {
      hero,
      visionMission,
      organization,
      documents,
    };
  }
}
