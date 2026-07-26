import { fetchCharacterSetById } from "@/lib/character-sets";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ setId: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { setId } = await context.params;
  const item = await fetchCharacterSetById(setId);

  if (!item) {
    return NextResponse.json({ error: "Character set not found" }, { status: 404 });
  }

  return NextResponse.json({ item });
}
