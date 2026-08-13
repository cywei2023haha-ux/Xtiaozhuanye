"use client";

import type { CharacterSet, CharacterSetsPageResponse } from "@/lib/character-sets";
import { useCallback, useEffect, useRef, useState } from "react";

const PAGE_SIZE = 20;

function shuffleArray<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = next[i];
    next[i] = next[j]!;
    next[j] = tmp!;
  }
  return next;
}

type UseCharacterSetsFeedOptions = {
  /** 第二屏：每页结果随机打乱；/gallery 保持后端 sort_order */
  shuffle?: boolean;
};

export function useCharacterSetsFeed(options: UseCharacterSetsFeedOptions = {}) {
  const { shuffle = false } = options;
  const [items, setItems] = useState<CharacterSet[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const shuffleRef = useRef(shuffle);
  shuffleRef.current = shuffle;

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
      const pageItems = shuffleRef.current
        ? shuffleArray(data.items)
        : data.items;

      setItems((prev) => (append ? [...prev, ...pageItems] : pageItems));
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

  return { items, loading, hasMore, sentinelRef };
}
