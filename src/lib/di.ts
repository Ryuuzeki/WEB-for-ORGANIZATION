import { MockLandingRepository } from "@/infrastructure/repositories/MockLandingRepository";
import { MockAIAssistantRepository } from "@/infrastructure/repositories/MockAIAssistantRepository";
import { BMKGRepository } from "@/infrastructure/repositories/BMKGRepository";
import { BPSRepository } from "@/infrastructure/repositories/BPSRepository";
import { GetLandingPageData } from "@/application/use-cases/GetLandingPageData";
import { AskAIAssistant } from "@/application/use-cases/AskAIAssistant";
import { GetRegionalAnalysis } from "@/application/use-cases/GetRegionalAnalysis";

/**
 * Dependency Injection Container / Composition Root
 * This is the ONLY place where infrastructure implementations are coupled with application use cases.
 */
export const di = {
  getLandingPageData: () => new GetLandingPageData(new MockLandingRepository()),
  getAskAIAssistant: () => new AskAIAssistant(new MockAIAssistantRepository()),
  getRegionalAnalysis: () => new GetRegionalAnalysis(new BMKGRepository(), new BPSRepository()),
};
