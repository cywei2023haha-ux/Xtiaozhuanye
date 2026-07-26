import { GEAR_IMAGE_ROLE } from "@/lib/image-roles";
import { getMockGearCatalog } from "@/lib/mock-images";
import {
  createSupabaseServer,
  IMAGE_SELECT,
  isSupabaseConfigured,
  mapImageRow,
} from "@/lib/supabase";
import type { ArchiveImage } from "@/lib/types";

const GEAR_FEATURED_LIMIT = 6;

export type GearImagesResponse = {
  items: ArchiveImage[];
  source: "supabase" | "mock";
};

export async function fetchGearImages(
  limit = GEAR_FEATURED_LIMIT,
): Promise<GearImagesResponse> {
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseServer();
    if (supabase) {
      const { data, error } = await supabase
        .from("images")
        .select(IMAGE_SELECT)
        .eq("image_role", GEAR_IMAGE_ROLE)
        .order("sort_order", { ascending: true })
        .limit(limit);

      if (!error && data) {
        return {
          items: data.map(mapImageRow),
          source: "supabase",
        };
      }
    }
  }

  return {
    items: getMockGearCatalog().slice(0, limit),
    source: "mock",
  };
}
