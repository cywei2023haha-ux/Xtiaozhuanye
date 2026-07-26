import {
  resolveRef,
  STAND_REF_COOKIE,
} from "@/lib/ref-injector";
import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { ref, subdomain, source } = resolveRef({
    searchParams: request.nextUrl.searchParams,
    host: request.headers.get("host") ?? "",
    cookieHeader: request.headers.get("cookie"),
  });

  const response = NextResponse.next();

  if (ref) {
    response.cookies.set(STAND_REF_COOKIE, ref, {
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
    });
    response.headers.set("x-stand-ref", ref);
    response.headers.set("x-stand-ref-source", source);
  }

  if (subdomain) {
    response.headers.set("x-stand-subdomain", subdomain);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
