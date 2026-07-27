import { GEAR_IMAGE_ROLE } from "@/lib/image-roles";
import { getMockGearCatalog } from "@/lib/mock-images";
import { isMockDataAllowed } from "@/lib/runtime-env";
import {
  createSupabaseServer,
  IMAGE_SELECT,
  isSupabaseConfigured,
  mapImageRow,
} from "@/lib/supabase";
import type { ArchiveImage } from "@/lib/types";

const GEAR_FEATURED_LIMIT = 6;

const SUPABASE_REQUIRED =
  "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) as Worker secrets/vars.";

export type GearImagesResponse = {
  items: ArchiveImage[];
  source: "supabase" | "mock";
};

export async function fetchGearImages(
  limit = GEAR_FEATURED_LIMIT,
): Promise<GearImagesResponse> {
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseServer();
    if (!supabase) {
      throw new Error("Supabase client unavailable");
    }

    const { data, error } = await supabase
      .from("images")
      .select(IMAGE_SELECT)
      .eq("image_role", GEAR_IMAGE_ROLE)
      .order("sort_order", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("[gear] supabase query failed", error);
      throw new Error(error.message);
    }

    return {
      items: (data ?? []).map(mapImageRow),
      source: "supabase",
    };
  }

  if (isMockDataAllowed()) {
    return {
      items: getMockGearCatalog().slice(0, limit),
      source: "mock",
    };
  }

  throw new Error(SUPABASE_REQUIRED);
}
