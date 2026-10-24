export interface CompetitionListing {
  id: string;
  title: string;
  audience: string;
  fee: string;
  mode: string;
  dateText: string;
  organizer: string;
  sourceUrl: string;
  imageUrl: string;
  isClosed: boolean;
}

export interface CompetitionFeed {
  items: CompetitionListing[];
  updatedAt: string;
  sourceAvailable: boolean;
}
