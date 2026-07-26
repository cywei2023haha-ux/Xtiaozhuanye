import {
  adminNotConfigured,
  adminUnauthorized,
  isAdminConfigured,
  verifyAdminRequest,
} from "@/lib/admin-auth";
import {
  buildObjectKey,
  buildPublicUrl,
  createPresignedUploadUrl,
  generateImageId,
  isR2Configured,
} from "@/lib/r2";
import { buildCharacterObjectKey } from "@/lib/character-storage";
import { r2PrefixForRole } from "@/lib/image-roles";
import type { ImageRole } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

type UploadRequestBody = {
  filename: string;
  contentType: string;
  imageId?: string;
  imageRole?: ImageRole;
  /** Character set upload: My_AI_Output/{folder}/{slot}.webp */
  characterFolder?: string;
  characterSlot?: number;
};

export async function POST(request: NextRequest) {
  if (!isAdminConfigured()) return adminNotConfigured();
  if (!verifyAdminRequest(request)) return adminUnauthorized();
  if (!isR2Configured()) {
    return NextResponse.json(
      { error: "R2 is not configured. Set R2_* env variables." },
      { status: 503 },
    );
  }

  let body: UploadRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { filename, contentType } = body;
  if (!filename || !contentType) {
    return NextResponse.json(
      { error: "filename and contentType are required" },
      { status: 400 },
    );
  }

  if (!contentType.startsWith("image/")) {
    return NextResponse.json(
      { error: "Only image uploads are allowed" },
      { status: 400 },
    );
  }

  const imageId = body.imageId?.trim() || generateImageId();
  const imageRole: ImageRole = body.imageRole ?? "archive";

  let key: string;
  if (body.characterFolder && body.characterSlot) {
    key = buildCharacterObjectKey(body.characterFolder, body.characterSlot);
  } else {
    const prefix = r2PrefixForRole(imageRole);
    key = buildObjectKey(filename, imageId, prefix);
  }
  const uploadUrl = await createPresignedUploadUrl(key, contentType);
  const publicUrl = buildPublicUrl(key);

  return NextResponse.json({
    imageId,
    key,
    uploadUrl,
    publicUrl,
  });
}
