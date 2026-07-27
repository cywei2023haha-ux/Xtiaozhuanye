import { fetchCharacterSetsPage } from "@/lib/character-sets";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const cursor = searchParams.get("cursor");
  const limit = Number(searchParams.get("limit") ?? "20");

  try {
    const page = await fetchCharacterSetsPage(cursor, limit);
    return NextResponse.json(page);
  } catch (error) {
    console.error("[api/character-sets]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch character sets",
      },
      { status: 500 },
    );
  }
}
