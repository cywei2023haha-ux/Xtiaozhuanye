import type { ImageRole } from "@/lib/types";

/** R2 object key prefix per image role */
export type R2StoragePrefix = "archive" | "avatars" | "gear" | "gallery";

export const R2_PREFIX_BY_ROLE: Record<ImageRole, R2StoragePrefix> = {
  archive: "archive",
  hero_avatar: "avatars",
  gear: "gear",
  gallery: "gallery",
};

export function r2PrefixForRole(role: ImageRole): R2StoragePrefix {
  return R2_PREFIX_BY_ROLE[role];
}

/** Screens 1–2 random pool */
export const FEATURED_IMAGE_ROLE: ImageRole = "archive";

/** Screen 4 gear product cards */
export const GEAR_IMAGE_ROLE: ImageRole = "gear";

/** Screen 5 infinite scroll + product tags */
export const GALLERY_IMAGE_ROLE: ImageRole = "gallery";
