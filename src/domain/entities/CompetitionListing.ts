export type CompetitionSourceName = "InfoLomba" | "SiLomba";

export interface CompetitionListing {
  id: string;
  title: string;
  audience: string;
  fee: string;
  mode: string;
  dateText: string;
  organizer: string;
  sourceUrl: string;
  sourceName: CompetitionSourceName;
  imageUrl: string;
  isClosed: boolean;
}

export interface CompetitionSourceStatus {
  name: CompetitionSourceName;
  available: boolean;
  itemCount: number;
}

export interface CompetitionFeed {
  items: CompetitionListing[];
  updatedAt: string;
  sourceAvailable: boolean;
  sources: CompetitionSourceStatus[];
}
