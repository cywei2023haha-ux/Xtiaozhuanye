import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME &&
      process.env.R2_PUBLIC_URL,
  );
}

function createR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID!;
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

import type { R2StoragePrefix } from "@/lib/image-roles";

export function buildObjectKey(
  filename: string,
  imageId: string,
  prefix: R2StoragePrefix = "archive",
): string {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${prefix}/${imageId}/${safeName}`;
}

export function buildPublicUrl(key: string): string {
  const base = process.env.R2_PUBLIC_URL!.replace(/\/$/, "");
  return `${base}/${key}`;
}

export async function createPresignedUploadUrl(
  key: string,
  contentType: string,
): Promise<string> {
  const client = createR2Client();
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(client, command, { expiresIn: 3600 });
}

export function generateImageId(): string {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `img_${stamp}_${rand}`;
}
