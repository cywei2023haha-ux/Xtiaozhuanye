import {
  adminNotConfigured,
  adminUnauthorized,
  isAdminConfigured,
  verifyAdminRequest,
} from "@/lib/admin-auth";
import { createSupabaseServer, IMAGE_SELECT, isSupabaseConfigured, mapImageRow } from "@/lib/supabase";
import type { AssociatedProduct, ImageRole } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

type CreateImageBody = {
  image_id: string;
  r2_url: string;
  is_locked?: boolean;
  sort_order?: number;
  image_role?: ImageRole;
  associated_products?: AssociatedProduct[];
};

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
    .from("images")
    .select(`${IMAGE_SELECT}, created_at`)
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [] });
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

  let body: CreateImageBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.image_id || !body.r2_url) {
    return NextResponse.json(
      { error: "image_id and r2_url are required" },
      { status: 400 },
    );
  }

  const supabase = createSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase client unavailable" }, { status: 503 });
  }

  const imageRole: ImageRole = body.image_role ?? "archive";

  if (imageRole === "hero_avatar") {
    await supabase.from("images").delete().eq("image_role", "hero_avatar");
  }

  let sortOrder = body.sort_order;
  if (sortOrder === undefined) {
    if (imageRole === "hero_avatar") {
      sortOrder = 0;
    } else {
      const { data: maxRow } = await supabase
        .from("images")
        .select("sort_order")
        .eq("image_role", imageRole)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();

      sortOrder = (maxRow?.sort_order ?? 0) + 1;
    }
  }

  const { data, error } = await supabase
    .from("images")
    .insert({
      image_id: body.image_id,
      r2_url: body.r2_url,
      is_locked: imageRole === "hero_avatar" ? false : (body.is_locked ?? false),
      sort_order: sortOrder,
      image_role: imageRole,
      associated_products: body.associated_products ?? [],
    })
    .select(IMAGE_SELECT)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item: mapImageRow(data) }, { status: 201 });
}
