"use server";

import { di } from "@/lib/di";

export async function askAIAction(query: string) {
  const useCase = di.getAskAIAssistant();
  return await useCase.execute(query);
}
