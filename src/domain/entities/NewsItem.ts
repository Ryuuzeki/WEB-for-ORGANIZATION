export interface NewsItem {
  id: string;
  title: string;
  category: string;
  summary: string;
  imageUrl: string;
  linkUrl: string;
  publishedAt: string;
  isPublished: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface NewsItemInput {
  id?: string;
  title: string;
  category: string;
  summary: string;
  imageUrl?: string;
  linkUrl?: string;
  publishedAt: string;
  isPublished: boolean;
  order: number;
}
