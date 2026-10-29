export type GalleryMediaType = "photo" | "video";

export interface GalleryMedia {
  id: string;
  type: GalleryMediaType;
  title: string;
  description: string;
  category: string;
  occurredAt: string;
  mediaUrl: string;
  thumbnailUrl: string;
  isPublished: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}
