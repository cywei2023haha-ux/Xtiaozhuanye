import { getEnv } from "@/lib/runtime-env";
import { NextRequest, NextResponse } from "next/server";

export function verifyAdminRequest(request: NextRequest): boolean {
  const adminKey = getEnv("ADMIN_API_KEY");
  if (!adminKey) return false;

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7) === adminKey;
  }

  const headerKey = request.headers.get("x-admin-key");
  return headerKey === adminKey;
}

export function adminUnauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function adminNotConfigured() {
  return NextResponse.json(
    { error: "Admin API key not configured on server" },
    { status: 503 },
  );
}

export function isAdminConfigured(): boolean {
  return Boolean(getEnv("ADMIN_API_KEY"));
}
