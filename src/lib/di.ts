import { MockLandingRepository } from "@/infrastructure/repositories/MockLandingRepository";
import { MockAIAssistantRepository } from "@/infrastructure/repositories/MockAIAssistantRepository";
import { GetLandingPageData } from "@/application/use-cases/GetLandingPageData";
import { AskAIAssistant } from "@/application/use-cases/AskAIAssistant";

/**
 * Dependency Injection Container / Composition Root
 * This is the ONLY place where infrastructure implementations are coupled with application use cases.
 */
export const di = {
  getLandingPageData: () => new GetLandingPageData(new MockLandingRepository()),
  getAskAIAssistant: () => new AskAIAssistant(new MockAIAssistantRepository()),
};
