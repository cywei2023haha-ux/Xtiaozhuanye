import { fetchCharacterSetsPage } from "@/lib/character-sets";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const cursor = searchParams.get("cursor");
  const limit = Number(searchParams.get("limit") ?? "20");

  const page = await fetchCharacterSetsPage(cursor, limit);
  return NextResponse.json(page);
}
