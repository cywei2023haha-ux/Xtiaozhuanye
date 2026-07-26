export type ImageRole = "archive" | "hero_avatar" | "gear" | "gallery";

export type AssociatedProduct = {
  product_id: string;
  name: string;
  price: string;
  shop_url: string;
  position_x: string;
  position_y: string;
};

export type ArchiveImage = {
  image_id: string;
  r2_url: string;
  is_locked: boolean;
  sort_order: number;
  image_role: ImageRole;
  associated_products: AssociatedProduct[];
};

export type ImagesPageResponse = {
  items: ArchiveImage[];
  nextCursor: string | null;
  hasMore: boolean;
  source: "supabase" | "mock";
};

export type FeaturedGalleryResponse = {
  heroBackground: ArchiveImage | null;
  heroAvatar: ArchiveImage | null;
  hubPages: ArchiveImage[][];
  source: "supabase" | "mock";
};

export const HUB_PAGE_COUNT = 5;
export const HUB_GRID_SIZE = 6;
