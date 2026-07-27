/**
 * Runtime env reader compatible with:
 * - `next dev` / `next build` (process.env + .env*)
 * - OpenNext Cloudflare Workers (getCloudflareContext().env + process.env)
 *
 * Worker Secrets/Vars live on the Cloudflare `env` binding. OpenNext may also
 * mirror them onto `process.env`, but older `compatibility_date` values (and
 * some edge paths) can miss that — always check both.
 */
import { getCloudflareContext } from "@opennextjs/cloudflare";

function readCloudflareBinding(key: string): string | undefined {
  try {
    const { env } = getCloudflareContext();
    const value = (env as Record<string, unknown>)[key];
    if (typeof value === "string" && value.length > 0) return value;
  } catch {
    // Outside Workers request context (build, tests, plain Node).
  }
  return undefined;
}

function readProcessEnv(key: string): string | undefined {
  const value = process.env[key];
  if (typeof value === "string" && value.length > 0) return value;
  return undefined;
}

/** Read a non-empty string env var from Cloudflare bindings or process.env. */
export function getEnv(key: string): string | undefined {
  return readCloudflareBinding(key) ?? readProcessEnv(key);
}

export function requireEnv(key: string): string {
  const value = getEnv(key);
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Mock catalog is for local demos only.
 * Production / Workers never fall back to mock unless ALLOW_MOCK_DATA=true.
 */
export function isMockDataAllowed(): boolean {
  const flag = getEnv("ALLOW_MOCK_DATA");
  if (flag === "true") return true;
  if (flag === "false") return false;
  return process.env.NODE_ENV !== "production";
}
