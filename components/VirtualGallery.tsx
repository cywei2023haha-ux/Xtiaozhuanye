"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { ImageArchiveCard } from "@/components/ImageArchiveCard";
import type { ArchiveImage, ImagesPageResponse } from "@/lib/types";

const PAGE_SIZE = 20;

export function VirtualGallery() {
  const [items, setItems] = useState<ArchiveImage[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<ImagesPageResponse["source"]>("mock");
  const loadingRef = useRef(false);

  const loadPage = useCallback(async (nextCursor: string | null, append: boolean) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        role: "gallery",
      });
      if (nextCursor) params.set("cursor", nextCursor);

      const res = await fetch(`/api/images?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load archive");

      const data: ImagesPageResponse = await res.json();

      setItems((prev) => (append ? [...prev, ...data.items] : data.items));
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
      setSource(data.source);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPage(null, false);
  }, [loadPage]);

  const rowCount = hasMore ? items.length + 1 : items.length;

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => 480,
    overscan: 4,
    scrollMargin: 0,
  });

  const virtualItems = virtualizer.getVirtualItems();

  useEffect(() => {
    const last = virtualItems[virtualItems.length - 1];
    if (!last || !hasMore || loading) return;

    if (last.index >= items.length - 3) {
      loadPage(cursor, true);
    }
  }, [virtualItems, hasMore, loading, items.length, cursor, loadPage]);

  return (
    <section
      id="archive-gallery"
      aria-label="Uncensored visual archive"
      className="border-t-4 border-black bg-white px-4 py-8 sm:px-6"
    >
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-jojo-purple">
              Extended Archive
            </p>
            <h3 className="text-2xl font-black uppercase sm:text-3xl">
              Uncensored <span className="text-jojo-cyan">Visuals</span>
            </h3>
          </div>
          <span className="border-2 border-black bg-jojo-yellow px-3 py-1 text-[10px] font-black uppercase">
            {source === "supabase" ? "Live DB" : "Mock Data"} · {items.length} loaded
          </span>
        </div>

        {error && (
          <p className="mb-4 border-4 border-black bg-red-100 px-4 py-3 text-sm font-medium">
            {error}
          </p>
        )}

        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualItems.map((virtualRow) => {
            const isLoaderRow = virtualRow.index >= items.length;
            const image = items[virtualRow.index];

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <div className="pb-6">
                  {isLoaderRow ? (
                    <div className="flex h-32 items-center justify-center border-4 border-dashed border-black/30">
                      <p className="text-xs font-black uppercase tracking-wider text-black/50">
                        {loading ? "Loading more visuals…" : "Scroll for more"}
                      </p>
                    </div>
                  ) : (
                    <ImageArchiveCard image={image} index={virtualRow.index} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!hasMore && items.length > 0 && (
          <p className="mt-4 text-center text-xs font-black uppercase tracking-wider text-black/40">
            — End of archive —
          </p>
        )}
      </div>
    </section>
  );
}
