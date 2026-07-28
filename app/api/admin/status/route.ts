import {
  adminNotConfigured,
  adminUnauthorized,
  isAdminConfigured,
  verifyAdminRequest,
} from "@/lib/admin-auth";
import { getEnv } from "@/lib/runtime-env";
import { getMissingR2EnvKeys, isR2Configured } from "@/lib/r2";
import { isSupabaseConfigured } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

/** Admin-only: which production secrets/vars are present (boolean only). */
export async function GET(request: NextRequest) {
  if (!isAdminConfigured()) return adminNotConfigured();
  if (!verifyAdminRequest(request)) return adminUnauthorized();

  const r2Missing = getMissingR2EnvKeys();

  return NextResponse.json({
    adminConfigured: true,
    supabaseConfigured: isSupabaseConfigured(),
    r2Configured: isR2Configured(),
    r2Missing,
    has: {
      ADMIN_API_KEY: Boolean(getEnv("ADMIN_API_KEY")),
      NEXT_PUBLIC_SUPABASE_URL: Boolean(getEnv("NEXT_PUBLIC_SUPABASE_URL")),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(getEnv("SUPABASE_SERVICE_ROLE_KEY")),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(
        getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      ),
      R2_ACCOUNT_ID: Boolean(getEnv("R2_ACCOUNT_ID")),
      R2_ACCESS_KEY_ID: Boolean(getEnv("R2_ACCESS_KEY_ID")),
      R2_SECRET_ACCESS_KEY: Boolean(getEnv("R2_SECRET_ACCESS_KEY")),
      R2_BUCKET_NAME: Boolean(getEnv("R2_BUCKET_NAME")),
      R2_PUBLIC_URL: Boolean(getEnv("R2_PUBLIC_URL")),
    },
    r2PublicUrlHost: (() => {
      const raw = getEnv("R2_PUBLIC_URL");
      if (!raw) return null;
      try {
        return new URL(raw).host;
      } catch {
        return "invalid-url";
      }
    })(),
  });
}
