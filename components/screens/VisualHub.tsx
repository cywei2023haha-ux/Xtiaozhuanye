"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { FillImage } from "@/components/ui/FillImage";
import { JojoCard } from "@/components/ui/JojoCard";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { useFeaturedGallery } from "@/hooks/useFeaturedGallery";
import { LINKS } from "@/lib/config";
import type { ArchiveImage } from "@/lib/types";
import { HUB_PAGE_COUNT } from "@/lib/types";
import Link from "next/link";

/** 手机竖屏比例 9:16 — 略小于格槽，留出边框/hover 位移空间 */
const PORTRAIT_CELL =
  "relative mx-auto w-[calc(100%-6px)] max-w-full aspect-[9/16] overflow-hidden";

function HubCell({
  image,
  cellIndex,
}: {
  image: ArchiveImage | null;
  cellIndex: number;
}) {
  const isLockedSlot = cellIndex >= 2;

  if (!image) {
    return (
      <Link href="/gallery" className="block no-underline">
        <div className={`${PORTRAIT_CELL} border-4 border-black bg-[#1a1a1a]`}>
          <div className="absolute inset-0 bg-gradient-to-br from-jojo-yellow to-jojo-purple opacity-40" />
        </div>
      </Link>
    );
  }

  const href = LINKS.gallery;

  if (isLockedSlot) {
    return (
      <Link href={href} className="block no-underline">
        <JojoCard hover="lift" className={`${PORTRAIT_CELL} bg-[#1a1a1a] p-0`}>
        <div className="absolute inset-0">
          <FillImage
            src={image.r2_url}
            alt={image.image_id}
            imageClassName="blur-md scale-105"
          />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/25">
          <span
            className="flex h-10 w-10 items-center justify-center border-4 border-black bg-jojo-cyan shadow-[4px_4px_0px_#D600FF] sm:h-12 sm:w-12"
            aria-hidden
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-black sm:h-6 sm:w-6"
              fill="currentColor"
              aria-hidden
            >
              <path d="M17 8h-1V6a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zm-3 0H10V6a2 2 0 1 1 4 0v2z" />
            </svg>
          </span>
        </div>
        </JojoCard>
      </Link>
    );
  }

  return (
    <Link href={href} className="block no-underline">
      <JojoCard hover="lift" className={`${PORTRAIT_CELL} p-0`}>
      <div className="absolute inset-0">
        <FillImage src={image.r2_url} alt={image.image_id} />
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-10 border-t-4 border-black bg-jojo-yellow/95 px-2 py-1">
        <span className="text-[9px] font-black uppercase tracking-wider sm:text-[10px]">
          Free Look
        </span>
      </div>
      </JojoCard>
    </Link>
  );
}

export function VisualHub({ className = "" }: { className?: string }) {
  const { hubPages, loading } = useFeaturedGallery();
  const [activePage, setActivePage] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const syncActivePage = useCallback(() => {
    const el = scrollerRef.current;
    if (!el || el.clientWidth === 0) return;
    const page = Math.round(el.scrollLeft / el.clientWidth);
    setActivePage(Math.min(Math.max(page, 0), HUB_PAGE_COUNT - 1));
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", syncActivePage, { passive: true });
    return () => el.removeEventListener("scroll", syncActivePage);
  }, [syncActivePage, loading]);

  const scrollToPage = (index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
    setActivePage(index);
  };

  const pages =
    hubPages.length >= HUB_PAGE_COUNT
      ? hubPages.slice(0, HUB_PAGE_COUNT)
      : Array.from({ length: HUB_PAGE_COUNT }, (_, i) => hubPages[i] ?? []);

  return (
    <ScreenShell
      id="visual-hub"
      label="CHARACTER SELECTION HUB"
      className={`${className}`}
      contentClassName="gap-4"
    >
      <div className="flex flex-col gap-4">
        <div className="shrink-0">
          <Link href={LINKS.gallery} className="block no-underline text-inherit">
            <h2 className="text-3xl font-black uppercase leading-none sm:text-4xl">
              View{" "}
              <span className="text-jojo-purple">All Profiles</span>
            </h2>
          </Link>
          <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-black/60">
            {loading ? (
              "Drawing random sets from archive..."
            ) : (
              <>
                Each character contains extended private visual collections
                <br />
                Full content unlocks after selection
              </>
            )}
          </p>
        </div>

        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth px-1 py-2 [scrollbar-width:none] sm:px-1.5 sm:py-2.5 [&::-webkit-scrollbar]:hidden"
        >
          {pages.map((page, pageIndex) => (
            <div
              key={`hub-page-${pageIndex}`}
              className="grid w-full min-w-full flex-shrink-0 snap-center grid-cols-2 auto-rows-auto gap-2 p-2 sm:gap-3 sm:p-3"
            >
              {Array.from({ length: 6 }, (_, cellIndex) => (
                <div key={`${pageIndex}-${cellIndex}`} className="p-0.5">
                  <HubCell
                    image={page[cellIndex] ?? null}
                    cellIndex={cellIndex}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="flex shrink-0 items-center justify-center gap-2">
          {Array.from({ length: HUB_PAGE_COUNT }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToPage(i)}
              aria-label={`Go to page ${i + 1}`}
              className={`h-2.5 border-2 border-black transition-all ${
                activePage === i
                  ? "w-8 bg-jojo-purple"
                  : "w-2.5 bg-jojo-yellow"
              }`}
            />
          ))}
        </div>
      </div>
    </ScreenShell>
  );
}
