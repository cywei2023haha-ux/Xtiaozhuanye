"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  appendRefToUrl,
  extractRef,
  getSubdomainFromHost,
  STAND_REF_COOKIE,
} from "@/lib/ref-injector";

type RefTrackerContextValue = {
  ref: string;
  subdomain: string | null;
  appendRef: (url: string, medium?: string) => string;
};

const RefTrackerContext = createContext<RefTrackerContextValue>({
  ref: "",
  subdomain: null,
  appendRef: (url) => url,
});

function readClientCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${name}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : "";
}

function subscribeToCookie(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("focus", callback);
  return () => window.removeEventListener("focus", callback);
}

function getCookieSnapshot() {
  return readClientCookie(STAND_REF_COOKIE);
}

function getServerCookieSnapshot() {
  return "";
}

export function RefTrackerProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const cookieRef = useSyncExternalStore(
    subscribeToCookie,
    getCookieSnapshot,
    getServerCookieSnapshot,
  );

  const subdomain = useMemo(() => {
    if (typeof window === "undefined") return null;
    return getSubdomainFromHost(window.location.host);
  }, []);

  const ref = useMemo(() => {
    const fromUrl = extractRef(searchParams);
    if (fromUrl) return fromUrl;
    return cookieRef;
  }, [searchParams, cookieRef]);

  const appendRef = useCallback(
    (url: string, medium = "bridge") => appendRefToUrl(url, ref, medium),
    [ref],
  );

  const value = useMemo(
    () => ({ ref, subdomain, appendRef }),
    [ref, subdomain, appendRef],
  );

  return (
    <RefTrackerContext.Provider value={value}>{children}</RefTrackerContext.Provider>
  );
}

export function useRefTracker() {
  return useContext(RefTrackerContext);
}
