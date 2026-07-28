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
  getMissingR2EnvKeys,
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
    const missing = getMissingR2EnvKeys();
    return NextResponse.json(
      {
        error: `R2 is not configured on the Worker. Missing: ${missing.join(", ")}. Set them as Cloudflare Worker Secrets/Vars, then redeploy.`,
        missing,
      },
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
  if (body.characterFolder && body.characterSlot != null && body.characterSlot > 0) {
    key = buildCharacterObjectKey(body.characterFolder, body.characterSlot);
  } else {
    const prefix = r2PrefixForRole(imageRole);
    key = buildObjectKey(filename, imageId, prefix);
  }

  try {
    const uploadUrl = await createPresignedUploadUrl(key, contentType);
    const publicUrl = buildPublicUrl(key);

    return NextResponse.json({
      imageId,
      key,
      uploadUrl,
      publicUrl,
    });
  } catch (error) {
    console.error("[api/admin/upload] presign failed", error);
    const message =
      error instanceof Error ? error.message : "Failed to create upload URL";
    return NextResponse.json(
      {
        error: `Failed to create R2 upload URL: ${message}`,
      },
      { status: 500 },
    );
  }
}
