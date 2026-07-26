import {
  adminNotConfigured,
  adminUnauthorized,
  isAdminConfigured,
  verifyAdminRequest,
} from "@/lib/admin-auth";
import { createSupabaseServer, IMAGE_SELECT, isSupabaseConfigured, mapImageRow } from "@/lib/supabase";
import type { AssociatedProduct } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ imageId: string }> };

type PatchBody = {
  is_locked?: boolean;
  sort_order?: number;
  associated_products?: AssociatedProduct[];
  r2_url?: string;
};

export async function GET(request: NextRequest, context: RouteContext) {
  if (!isAdminConfigured()) return adminNotConfigured();
  if (!verifyAdminRequest(request)) return adminUnauthorized();
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  const { imageId } = await context.params;
  const supabase = createSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase client unavailable" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("images")
    .select(IMAGE_SELECT)
    .eq("image_id", imageId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  return NextResponse.json({ item: mapImageRow(data) });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!isAdminConfigured()) return adminNotConfigured();
  if (!verifyAdminRequest(request)) return adminUnauthorized();
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  const { imageId } = await context.params;

  let body: PatchBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const supabase = createSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase client unavailable" }, { status: 503 });
  }

  const updates: PatchBody = {};
  if (body.is_locked !== undefined) updates.is_locked = body.is_locked;
  if (body.sort_order !== undefined) updates.sort_order = body.sort_order;
  if (body.associated_products !== undefined) {
    updates.associated_products = body.associated_products;
  }
  if (body.r2_url !== undefined) updates.r2_url = body.r2_url;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("images")
    .update(updates)
    .eq("image_id", imageId)
    .select(IMAGE_SELECT)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item: mapImageRow(data) });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!isAdminConfigured()) return adminNotConfigured();
  if (!verifyAdminRequest(request)) return adminUnauthorized();

  const { imageId } = await context.params;
  const supabase = createSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase client unavailable" }, { status: 503 });
  }

  const { error } = await supabase.from("images").delete().eq("image_id", imageId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
