import { LINKS } from "@/lib/config";
import {
  CHARACTER_SLOT_COUNT,
  formatCharacterDisplayName,
} from "@/lib/character-storage";
import { createSupabaseServer, isSupabaseConfigured } from "@/lib/supabase";

export type CharacterSet = {
  set_id: string;
  folder_slug: string;
  display_name: string;
  preview_images: string[];
  unlock_url: string;
  sort_order: number;
};

export type CharacterSetsPageResponse = {
  items: CharacterSet[];
  nextCursor: string | null;
  hasMore: boolean;
  source: "supabase" | "mock";
};

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

type CharacterSetRow = {
  set_id: string;
  folder_slug: string;
  display_name: string;
  preview_images: string[] | null;
  unlock_url: string;
  sort_order: number;
};

export const CHARACTER_SET_SELECT =
  "set_id, folder_slug, display_name, preview_images, unlock_url, sort_order";

function mapCharacterSetRow(row: CharacterSetRow): CharacterSet {
  const images = Array.isArray(row.preview_images) ? row.preview_images : [];
  return {
    set_id: row.set_id,
    folder_slug: row.folder_slug,
    display_name: row.display_name,
    preview_images: images.slice(0, CHARACTER_SLOT_COUNT),
    unlock_url: row.unlock_url || LINKS.fanClub,
    sort_order: row.sort_order,
  };
}

const MOCK_CHARACTER_SETS: CharacterSet[] = [
  {
    set_id: "anis_swimsuit_01",
    folder_slug: "anis_swimsuit_01",
    display_name: "Anis Swimsuit",
    preview_images: [],
    unlock_url: LINKS.fanClub,
    sort_order: 1,
  },
  {
    set_id: "tifa_bunny_02",
    folder_slug: "tifa_bunny_02",
    display_name: "Tifa Bunny",
    preview_images: [],
    unlock_url: LINKS.fanClub,
    sort_order: 2,
  },
  {
    set_id: "kafka_suit_01",
    folder_slug: "kafka_suit_01",
    display_name: "Kafka Suit",
    preview_images: [],
    unlock_url: LINKS.fanClub,
    sort_order: 3,
  },
];

export function getMockCharacterSets(): CharacterSet[] {
  return MOCK_CHARACTER_SETS;
}

export function getCharacterCoverUrl(set: CharacterSet): string | null {
  const first = set.preview_images.find((url) => url.startsWith("http"));
  return first ?? null;
}

export async function fetchCharacterSetsPage(
  cursor: string | null,
  limit = DEFAULT_LIMIT,
): Promise<CharacterSetsPageResponse> {
  const pageSize = Math.min(Math.max(limit, 1), MAX_LIMIT);

  if (isSupabaseConfigured()) {
    const supabase = createSupabaseServer();
    if (supabase) {
      let query = supabase
        .from("character_sets")
        .select(CHARACTER_SET_SELECT)
        .order("sort_order", { ascending: true })
        .limit(pageSize + 1);

      if (cursor) {
        const cursorOrder = Number(cursor);
        if (Number.isFinite(cursorOrder)) {
          query = query.gt("sort_order", cursorOrder);
        }
      }

      const { data, error } = await query;

      if (!error && data) {
        const rows = data.slice(0, pageSize).map(mapCharacterSetRow);
        const hasMore = data.length > pageSize;
        const nextCursor =
          hasMore && rows.length > 0
            ? String(rows[rows.length - 1].sort_order)
            : null;

        return { items: rows, nextCursor, hasMore, source: "supabase" };
      }
    }
  }

  const all = getMockCharacterSets();
  let start = 0;
  if (cursor) {
    const cursorOrder = Number(cursor);
    const idx = all.findIndex((s) => s.sort_order > cursorOrder);
    start = idx >= 0 ? idx : all.length;
  }

  const items = all.slice(start, start + pageSize);
  const hasMore = start + pageSize < all.length;
  const nextCursor =
    hasMore && items.length > 0
      ? String(items[items.length - 1].sort_order)
      : null;

  return { items, nextCursor, hasMore, source: "mock" };
}

export async function fetchCharacterSetById(
  setId: string,
): Promise<CharacterSet | null> {
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseServer();
    if (supabase) {
      const { data, error } = await supabase
        .from("character_sets")
        .select(CHARACTER_SET_SELECT)
        .eq("set_id", setId)
        .maybeSingle();

      if (!error && data) return mapCharacterSetRow(data);
    }
  }

  return getMockCharacterSets().find((s) => s.set_id === setId) ?? null;
}

export function buildEmptyPreviewSlots(): string[] {
  return Array.from({ length: CHARACTER_SLOT_COUNT }, () => "");
}
