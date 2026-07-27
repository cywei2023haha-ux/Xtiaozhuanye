import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/runtime-env";
import type { ArchiveImage, AssociatedProduct, ImageRole } from "@/lib/types";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    getEnv("NEXT_PUBLIC_SUPABASE_URL") &&
      (getEnv("SUPABASE_SERVICE_ROLE_KEY") ||
        getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")),
  );
}

export function createSupabaseServer(): SupabaseClient | null {
  const url = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key =
    getEnv("SUPABASE_SERVICE_ROLE_KEY") ??
    getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

type ImageRow = {
  image_id: string;
  r2_url: string;
  is_locked: boolean;
  sort_order: number;
  image_role?: ImageRole | string | null;
  associated_products: AssociatedProduct[] | null;
};

export function mapImageRow(row: ImageRow): ArchiveImage {
  return {
    image_id: row.image_id,
    r2_url: row.r2_url,
    is_locked: row.is_locked,
    sort_order: row.sort_order,
    image_role: (row.image_role as ImageRole) ?? "archive",
    associated_products: row.associated_products ?? [],
  };
}

export const IMAGE_SELECT =
  "image_id, r2_url, is_locked, sort_order, image_role, associated_products";
