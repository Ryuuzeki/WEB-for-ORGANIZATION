import { HeroContent } from "../entities/HeroContent";
import { VisionMission } from "../entities/VisionMission";
import { Member } from "../entities/Member";
import { Document } from "../entities/Document";

export interface ILandingRepository {
  getHeroContent(): Promise<HeroContent>;
  getVisionMission(): Promise<VisionMission>;
  getOrganizationStructure(): Promise<Member[]>;
  getLatestDocuments(): Promise<Document[]>;

  // Write operations
  updateHeroContent(content: HeroContent): Promise<void>;
  updateVisionMission(visionMission: VisionMission): Promise<void>;
  saveMember(member: Member): Promise<void>;
  deleteMember(id: string): Promise<void>;
  saveDocument(document: Document): Promise<void>;
  deleteDocument(id: string): Promise<void>;
}
