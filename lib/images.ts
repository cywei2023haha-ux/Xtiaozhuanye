import { GALLERY_IMAGE_ROLE } from "@/lib/image-roles";
import { fetchMockImagesPage } from "@/lib/mock-images";
import { isMockDataAllowed } from "@/lib/runtime-env";
import {
  createSupabaseServer,
  IMAGE_SELECT,
  isSupabaseConfigured,
  mapImageRow,
} from "@/lib/supabase";
import type { ImageRole, ImagesPageResponse } from "@/lib/types";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

const SUPABASE_REQUIRED =
  "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) as Worker secrets/vars.";

export async function fetchImagesPage(
  cursor: string | null,
  limit = DEFAULT_LIMIT,
  role: ImageRole = GALLERY_IMAGE_ROLE,
): Promise<ImagesPageResponse> {
  const pageSize = Math.min(Math.max(limit, 1), MAX_LIMIT);

  if (isSupabaseConfigured()) {
    const supabase = createSupabaseServer();
    if (!supabase) {
      throw new Error("Supabase client unavailable");
    }

    let query = supabase
      .from("images")
      .select(IMAGE_SELECT)
      .eq("image_role", role)
      .order("sort_order", { ascending: true })
      .limit(pageSize + 1);

    if (cursor) {
      const cursorOrder = Number(cursor);
      if (Number.isFinite(cursorOrder)) {
        query = query.gt("sort_order", cursorOrder);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("[images] supabase query failed", error);
      throw new Error(error.message);
    }

    const rows = (data ?? []).slice(0, pageSize).map(mapImageRow);
    const hasMore = (data?.length ?? 0) > pageSize;
    const nextCursor =
      hasMore && rows.length > 0
        ? String(rows[rows.length - 1].sort_order)
        : null;

    return { items: rows, nextCursor, hasMore, source: "supabase" };
  }

  if (isMockDataAllowed()) {
    const mock = fetchMockImagesPage(cursor, pageSize, role);
    return { ...mock, source: "mock" };
  }

  throw new Error(SUPABASE_REQUIRED);
}
