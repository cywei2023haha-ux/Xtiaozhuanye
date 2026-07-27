import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { R2StoragePrefix } from "@/lib/image-roles";
import { getEnv, requireEnv } from "@/lib/runtime-env";

export function isR2Configured(): boolean {
  return Boolean(
    getEnv("R2_ACCOUNT_ID") &&
      getEnv("R2_ACCESS_KEY_ID") &&
      getEnv("R2_SECRET_ACCESS_KEY") &&
      getEnv("R2_BUCKET_NAME") &&
      getEnv("R2_PUBLIC_URL"),
  );
}

function createR2Client(): S3Client {
  const accountId = requireEnv("R2_ACCOUNT_ID");
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });
}

export function buildObjectKey(
  filename: string,
  imageId: string,
  prefix: R2StoragePrefix = "archive",
): string {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${prefix}/${imageId}/${safeName}`;
}

export function buildPublicUrl(key: string): string {
  const base = requireEnv("R2_PUBLIC_URL").replace(/\/$/, "");
  return `${base}/${key}`;
}

export async function createPresignedUploadUrl(
  key: string,
  contentType: string,
): Promise<string> {
  const client = createR2Client();
  const command = new PutObjectCommand({
    Bucket: requireEnv("R2_BUCKET_NAME"),
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
