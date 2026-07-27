import { fetchImagesPage } from "@/lib/images";
import { GALLERY_IMAGE_ROLE } from "@/lib/image-roles";
import type { ImageRole } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

const VALID_ROLES: ImageRole[] = ["gallery", "archive", "gear"];

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const cursor = searchParams.get("cursor");
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : undefined;
  const roleParam = searchParams.get("role") as ImageRole | null;
  const role =
    roleParam && VALID_ROLES.includes(roleParam) ? roleParam : GALLERY_IMAGE_ROLE;

  try {
    const page = await fetchImagesPage(cursor, limit, role);
    return NextResponse.json(page);
  } catch (error) {
    console.error("[api/images]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch images",
      },
      { status: 500 },
    );
  }
}
