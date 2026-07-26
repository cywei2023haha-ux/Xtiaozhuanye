export const STAND_REF_COOKIE = "stand_ref";

export function extractRef(searchParams: URLSearchParams): string {
  return (
    searchParams.get("ref") ??
    searchParams.get("utm_source") ??
    ""
  ).trim();
}

export function getRootDomain(): string {
  return (
    process.env.ROOT_DOMAIN ??
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ??
    ""
  ).trim();
}

/** Extract subdomain from Host header. Supports *.localhost for local dev. */
export function getSubdomainFromHost(host: string): string | null {
  const hostname = host.split(":")[0].toLowerCase();

  if (hostname.endsWith(".localhost")) {
    const sub = hostname.replace(/\.localhost$/, "");
    if (sub && sub !== "www") return sub;
    return null;
  }

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return null;
  }

  const root = getRootDomain();

  if (root) {
    if (hostname === root || hostname === `www.${root}`) return null;
    if (!hostname.endsWith(`.${root}`)) return null;
    const sub = hostname.slice(0, -(root.length + 1));
    if (!sub || sub === "www") return null;
    return sub.split(".")[0] || null;
  }

  const parts = hostname.split(".");
  if (parts.length >= 3 && parts[0] !== "www") {
    return parts[0];
  }

  return null;
}

export function mapSubdomainToRef(subdomain: string): string {
  const mapJson = process.env.REF_SUBDOMAIN_MAP;
  if (mapJson) {
    try {
      const map = JSON.parse(mapJson) as Record<string, string>;
      if (map[subdomain]) return map[subdomain];
    } catch {
      /* ignore invalid JSON */
    }
  }
  return subdomain;
}

export function appendRefToUrl(url: string, ref: string, medium = "bridge"): string {
  if (!ref) return url;

  try {
    const parsed = new URL(url);
    parsed.searchParams.set("utm_source", ref);
    if (!parsed.searchParams.has("utm_medium")) {
      parsed.searchParams.set("utm_medium", medium);
    }
    return parsed.toString();
  } catch {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}utm_source=${encodeURIComponent(ref)}&utm_medium=${encodeURIComponent(medium)}`;
  }
}

export function readRefCookie(cookieHeader: string | null): string {
  if (!cookieHeader) return "";
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${STAND_REF_COOKIE}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : "";
}

export type RefResolution = {
  ref: string;
  subdomain: string | null;
  source: "query" | "subdomain" | "cookie" | "none";
};

export function resolveRef(input: {
  searchParams: URLSearchParams;
  host: string;
  cookieHeader?: string | null;
}): RefResolution {
  const queryRef = extractRef(input.searchParams);
  if (queryRef) {
    return {
      ref: queryRef,
      subdomain: getSubdomainFromHost(input.host),
      source: "query",
    };
  }

  const subdomain = getSubdomainFromHost(input.host);
  if (subdomain) {
    return {
      ref: mapSubdomainToRef(subdomain),
      subdomain,
      source: "subdomain",
    };
  }

  const cookieRef = readRefCookie(input.cookieHeader ?? null);
  if (cookieRef) {
    return {
      ref: cookieRef,
      subdomain: null,
      source: "cookie",
    };
  }

  return { ref: "", subdomain: null, source: "none" };
}
