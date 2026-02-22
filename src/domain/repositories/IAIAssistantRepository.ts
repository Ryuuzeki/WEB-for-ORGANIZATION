export interface IAIAssistantRepository {
  ask(query: string): Promise<string>;
}
