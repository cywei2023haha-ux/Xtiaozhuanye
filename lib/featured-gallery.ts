import { getMockArchiveCatalog } from "@/lib/mock-images";
import { chunkArray, shuffleArray } from "@/lib/shuffle";
import {
  createSupabaseServer,
  IMAGE_SELECT,
  isSupabaseConfigured,
  mapImageRow,
} from "@/lib/supabase";
import type { ArchiveImage, FeaturedGalleryResponse } from "@/lib/types";
import { HUB_GRID_SIZE, HUB_PAGE_COUNT } from "@/lib/types";

const HERO_BG_COUNT = 1;
const HUB_TOTAL = HUB_PAGE_COUNT * HUB_GRID_SIZE;
const RANDOM_POOL_SIZE = HERO_BG_COUNT + HUB_TOTAL;

function pickWithRepeat(pool: ArchiveImage[], count: number): ArchiveImage[] {
  if (pool.length === 0) return [];
  const shuffled = shuffleArray(pool);
  const result: ArchiveImage[] = [];
  for (let i = 0; i < count; i += 1) {
    result.push(shuffled[i % shuffled.length]);
  }
  return result;
}

function buildFeaturedFromArchive(
  archive: ArchiveImage[],
  heroAvatar: ArchiveImage | null,
): Pick<FeaturedGalleryResponse, "heroBackground" | "heroAvatar" | "hubPages"> {
  const pool =
    heroAvatar === null
      ? archive
      : archive.filter(
          (img) =>
            img.image_id !== heroAvatar.image_id &&
            img.r2_url !== heroAvatar.r2_url,
        );

  const picked = pickWithRepeat(pool, RANDOM_POOL_SIZE);
  const heroBackground = picked[0] ?? null;
  const hubFlat = picked.slice(HERO_BG_COUNT, HERO_BG_COUNT + HUB_TOTAL);
  const hubChunks = chunkArray(hubFlat, HUB_GRID_SIZE);
  const hubPages: ArchiveImage[][] = [];

  for (let p = 0; p < HUB_PAGE_COUNT; p += 1) {
    hubPages.push(hubChunks[p] ?? []);
  }

  return {
    heroBackground,
    heroAvatar,
    hubPages,
  };
}

export async function fetchFeaturedGallery(): Promise<FeaturedGalleryResponse> {
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseServer();
    if (supabase) {
      const [archiveRes, avatarRes] = await Promise.all([
        supabase
          .from("images")
          .select(IMAGE_SELECT)
          .eq("image_role", "archive"),
        supabase
          .from("images")
          .select(IMAGE_SELECT)
          .eq("image_role", "hero_avatar")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (!archiveRes.error && archiveRes.data) {
        const archive = archiveRes.data.map(mapImageRow);
        const heroAvatar = avatarRes.data ? mapImageRow(avatarRes.data) : null;
        return {
          ...buildFeaturedFromArchive(archive, heroAvatar),
          source: "supabase",
        };
      }
    }
  }

  const archive = getMockArchiveCatalog();
  return {
    ...buildFeaturedFromArchive(archive, null),
    source: "mock",
  };
}
