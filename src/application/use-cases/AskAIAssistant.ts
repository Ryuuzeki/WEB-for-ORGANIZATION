import { IAIAssistantRepository } from "@/domain/repositories/IAIAssistantRepository";

export class AskAIAssistant {
  constructor(private aiRepository: IAIAssistantRepository) {}

  async execute(query: string) {
    if (!query || query.trim().length === 0) {
      throw new Error("Query cannot be empty");
    }
    return await this.aiRepository.ask(query);
  }
}
