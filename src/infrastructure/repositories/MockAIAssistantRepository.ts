import { IAIAssistantRepository } from "@/domain/repositories/IAIAssistantRepository";

export class MockAIAssistantRepository implements IAIAssistantRepository {
  async ask(query: string): Promise<string> {
    return `Terima kasih atas pertanyaannya mengenai "${query}". Sebagai asisten HMTKBA, saya menyarankan Anda untuk melihat panduan teknis di Pusat Dokumen kami atau menghubungi divisi terkait.`;
  }
}
