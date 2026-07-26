import {
  adminNotConfigured,
  adminUnauthorized,
  isAdminConfigured,
  verifyAdminRequest,
} from "@/lib/admin-auth";
import { createSupabaseServer, isSupabaseConfigured } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ setId: string }> };

export async function DELETE(_request: NextRequest, context: RouteContext) {
  if (!isAdminConfigured()) return adminNotConfigured();
  if (!verifyAdminRequest(_request)) return adminUnauthorized();
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 },
    );
  }

  const { setId } = await context.params;
  const supabase = createSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase client unavailable" }, { status: 503 });
  }

  const { error } = await supabase
    .from("character_sets")
    .delete()
    .eq("set_id", setId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
