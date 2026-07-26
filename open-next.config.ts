import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // Enable ISR cache via R2 — uncomment after binding NEXT_INC_CACHE_R2_BUCKET in wrangler.jsonc:
  // incrementalCache: (await import("@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache")).default,
});
