"use client";

import type { ArchiveImage, FeaturedGalleryResponse } from "@/lib/types";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type FeaturedGalleryContextValue = {
  loading: boolean;
  error: string | null;
  heroBackground: ArchiveImage | null;
  heroAvatar: ArchiveImage | null;
  hubPages: ArchiveImage[][];
  source: FeaturedGalleryResponse["source"] | null;
};

const FeaturedGalleryContext = createContext<FeaturedGalleryContextValue>({
  loading: true,
  error: null,
  heroBackground: null,
  heroAvatar: null,
  hubPages: [],
  source: null,
});

export function FeaturedGalleryProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FeaturedGalleryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/images/featured", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load featured images");
        return res.json() as Promise<FeaturedGalleryResponse>;
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Load failed");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      loading,
      error,
      heroBackground: data?.heroBackground ?? null,
      heroAvatar: data?.heroAvatar ?? null,
      hubPages: data?.hubPages ?? [],
      source: data?.source ?? null,
    }),
    [data, error, loading],
  );

  return (
    <FeaturedGalleryContext.Provider value={value}>
      {children}
    </FeaturedGalleryContext.Provider>
  );
}

export function useFeaturedGallery() {
  return useContext(FeaturedGalleryContext);
}
