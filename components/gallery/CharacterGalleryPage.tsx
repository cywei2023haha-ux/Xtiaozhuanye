"use client";

import { CharacterWaterfall } from "@/components/gallery/CharacterWaterfall";
import { GalleryTopNav } from "@/components/gallery/GalleryTopNav";
import type { CharacterSet, CharacterSetsPageResponse } from "@/lib/character-sets";
import { useCallback, useEffect, useRef, useState } from "react";

const PAGE_SIZE = 20;

export function CharacterGalleryPage() {
  const [items, setItems] = useState<CharacterSet[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadPage = useCallback(async (nextCursor: string | null, append: boolean) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
      if (nextCursor) params.set("cursor", nextCursor);

      const res = await fetch(`/api/character-sets?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load character sets");

      const data: CharacterSetsPageResponse = await res.json();
      setItems((prev) => (append ? [...prev, ...data.items] : data.items));
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch {
      if (!append) setItems([]);
      setHasMore(false);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPage(null, false);
  }, [loadPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loadingRef.current) {
          loadPage(cursor, true);
        }
      },
      { rootMargin: "240px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [cursor, hasMore, loadPage]);

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <GalleryTopNav backHref="/#visual-hub" backLabel="BACK TO HUB" />
      <div className="site-canvas mx-auto w-full">
        <CharacterWaterfall items={items} loading={loading} hasMore={hasMore} />
        <div ref={sentinelRef} className="h-1" aria-hidden />
      </div>
    </div>
  );
}
