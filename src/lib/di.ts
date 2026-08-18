import { JsonLandingRepository } from "@/infrastructure/repositories/JsonLandingRepository";
import { BMKGRepository } from "@/infrastructure/repositories/BMKGRepository";
import { JsonRegionalStatRepository } from "@/infrastructure/repositories/JsonRegionalStatRepository";
import { GetLandingPageData } from "@/application/use-cases/GetLandingPageData";
import { GetOrganizationStructure } from "@/application/use-cases/GetOrganizationStructure";
import { GetRegionalAnalysis } from "@/application/use-cases/GetRegionalAnalysis";

const landingRepository = new JsonLandingRepository();
const regionalStatRepository = new JsonRegionalStatRepository();

/**
 * Dependency Injection Container / Composition Root
 * This is the ONLY place where infrastructure implementations are coupled with application use cases.
 */
export const di = {
  getLandingPageData: () => new GetLandingPageData(landingRepository),
  getOrganizationStructure: () => new GetOrganizationStructure(landingRepository),
  getRegionalAnalysis: () => new GetRegionalAnalysis(new BMKGRepository(), regionalStatRepository),
  getLandingRepository: () => landingRepository,
  getRegionalStatRepository: () => regionalStatRepository,
};
