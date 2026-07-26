import { fetchFeaturedGallery } from "@/lib/featured-gallery";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const featured = await fetchFeaturedGallery();
    return NextResponse.json(featured, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("[api/images/featured]", error);
    return NextResponse.json(
      { error: "Failed to fetch featured gallery" },
      { status: 500 },
    );
  }
}
