import { HeroContent } from "../entities/HeroContent";
import { VisionMission } from "../entities/VisionMission";
import { Member } from "../entities/Member";
import { Document } from "../entities/Document";

export interface ILandingRepository {
  getHeroContent(): Promise<HeroContent>;
  getVisionMission(): Promise<VisionMission>;
  getOrganizationStructure(): Promise<Member[]>;
  getLatestDocuments(): Promise<Document[]>;
}
