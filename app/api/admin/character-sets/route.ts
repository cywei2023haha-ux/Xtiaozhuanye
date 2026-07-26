import {
  adminNotConfigured,
  adminUnauthorized,
  isAdminConfigured,
  verifyAdminRequest,
} from "@/lib/admin-auth";
import {
  buildEmptyPreviewSlots,
  CHARACTER_SET_SELECT,
  type CharacterSet,
} from "@/lib/character-sets";
import {
  CHARACTER_SLOT_COUNT,
  formatCharacterDisplayName,
  slugifyCharacterFolder,
} from "@/lib/character-storage";
import { LINKS } from "@/lib/config";
import { createSupabaseServer, isSupabaseConfigured } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

type CreateCharacterSetBody = {
  folder_slug?: string;
  display_name?: string;
  unlock_url?: string;
};

type UpdateCharacterSetBody = {
  set_id: string;
  display_name?: string;
  unlock_url?: string;
  preview_images?: string[];
  sort_order?: number;
};

function mapRow(row: {
  set_id: string;
  folder_slug: string;
  display_name: string;
  preview_images: string[] | null;
  unlock_url: string;
  sort_order: number;
}): CharacterSet {
  return {
    set_id: row.set_id,
    folder_slug: row.folder_slug,
    display_name: row.display_name,
    preview_images: Array.isArray(row.preview_images)
      ? row.preview_images.slice(0, CHARACTER_SLOT_COUNT)
      : buildEmptyPreviewSlots(),
    unlock_url: row.unlock_url || LINKS.fanClub,
    sort_order: row.sort_order,
  };
}

export async function GET(request: NextRequest) {
  if (!isAdminConfigured()) return adminNotConfigured();
  if (!verifyAdminRequest(request)) return adminUnauthorized();
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 },
    );
  }

  const supabase = createSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase client unavailable" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("character_sets")
    .select(`${CHARACTER_SET_SELECT}, created_at`)
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: (data ?? []).map(mapRow) });
}

export async function POST(request: NextRequest) {
  if (!isAdminConfigured()) return adminNotConfigured();
  if (!verifyAdminRequest(request)) return adminUnauthorized();
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 },
    );
  }

  let body: CreateCharacterSetBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const folderSlug =
    slugifyCharacterFolder(body.folder_slug ?? body.display_name ?? "");
  if (!folderSlug) {
    return NextResponse.json(
      { error: "folder_slug or display_name is required" },
      { status: 400 },
    );
  }

  const displayName =
    body.display_name?.trim() || formatCharacterDisplayName(folderSlug);
  const unlockUrl = body.unlock_url?.trim() || LINKS.fanClub;

  const supabase = createSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase client unavailable" }, { status: 503 });
  }

  const { data: maxRow } = await supabase
    .from("character_sets")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sortOrder = (maxRow?.sort_order ?? 0) + 1;

  const { data, error } = await supabase
    .from("character_sets")
    .insert({
      set_id: folderSlug,
      folder_slug: folderSlug,
      display_name: displayName,
      preview_images: buildEmptyPreviewSlots(),
      unlock_url: unlockUrl,
      sort_order: sortOrder,
    })
    .select(CHARACTER_SET_SELECT)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item: mapRow(data) }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  if (!isAdminConfigured()) return adminNotConfigured();
  if (!verifyAdminRequest(request)) return adminUnauthorized();
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 },
    );
  }

  let body: UpdateCharacterSetBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.set_id) {
    return NextResponse.json({ error: "set_id is required" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (body.display_name !== undefined) patch.display_name = body.display_name;
  if (body.unlock_url !== undefined) patch.unlock_url = body.unlock_url;
  if (body.sort_order !== undefined) patch.sort_order = body.sort_order;
  if (body.preview_images !== undefined) {
    const slots = buildEmptyPreviewSlots();
    body.preview_images.slice(0, CHARACTER_SLOT_COUNT).forEach((url, i) => {
      slots[i] = url;
    });
    patch.preview_images = slots;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const supabase = createSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase client unavailable" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("character_sets")
    .update(patch)
    .eq("set_id", body.set_id)
    .select(CHARACTER_SET_SELECT)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item: mapRow(data) });
}
