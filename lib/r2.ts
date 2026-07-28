import { AwsClient } from "aws4fetch";
import type { R2StoragePrefix } from "@/lib/image-roles";
import { getEnv, requireEnv } from "@/lib/runtime-env";

const R2_ENV_KEYS = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_PUBLIC_URL",
] as const;

const PRESIGN_EXPIRES_SECONDS = 3600;

export function getMissingR2EnvKeys(): string[] {
  return R2_ENV_KEYS.filter((key) => !getEnv(key));
}

export function isR2Configured(): boolean {
  return getMissingR2EnvKeys().length === 0;
}

/**
 * Presign with aws4fetch (Web Crypto) — AWS SDK v3 pulls Node `fs` via unenv
 * on Cloudflare Workers and throws: fs.readFile is not implemented yet.
 */
function createAwsClient(): AwsClient {
  return new AwsClient({
    accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    service: "s3",
    region: "auto",
  });
}

function buildR2ObjectUrl(key: string): URL {
  const accountId = requireEnv("R2_ACCOUNT_ID");
  const bucket = requireEnv("R2_BUCKET_NAME");
  const encodedKey = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const url = new URL(
    `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${encodedKey}`,
  );
  url.searchParams.set("X-Amz-Expires", String(PRESIGN_EXPIRES_SECONDS));
  return url;
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
  const client = createAwsClient();
  const objectUrl = buildR2ObjectUrl(key);

  const signed = await client.sign(
    new Request(objectUrl.toString(), {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
      },
    }),
    {
      aws: { signQuery: true },
    },
  );

  return signed.url;
}

export function generateImageId(): string {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `img_${stamp}_${rand}`;
}
