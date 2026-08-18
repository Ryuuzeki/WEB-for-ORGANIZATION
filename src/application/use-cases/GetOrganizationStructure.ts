import { ILandingRepository } from "@/domain/repositories/ILandingRepository";

export class GetOrganizationStructure {
  constructor(private landingRepository: ILandingRepository) {}

  async execute() {
    return this.landingRepository.getOrganizationStructure();
  }
}
