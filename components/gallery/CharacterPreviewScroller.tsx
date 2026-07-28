"use client";

import { GalleryTopNav } from "@/components/gallery/GalleryTopNav";
import { PaywallCard } from "@/components/gallery/PaywallCard";
import { CHARACTER_SLOT_COUNT } from "@/lib/character-storage";
import type { CharacterSet } from "@/lib/character-sets";
import { useState } from "react";

type CharacterPreviewScrollerProps = {
  characterSet: CharacterSet;
};

/**
 * Mobile-safe portrait frame:
 * - Slide height uses svh (not % of flex parent — broken on iOS).
 * - Frame size from width + aspect-ratio (absolute children don't collapse the box).
 */
const SLIDE =
  "box-border flex h-[calc(100svh-52px)] min-h-[calc(100svh-52px)] w-full shrink-0 snap-start snap-always items-center justify-center px-3 py-3";

const FRAME =
  "relative w-[min(100%,calc((100svh-76px)*9/16))] aspect-[9/16] overflow-hidden border-4 border-black bg-[#1a1a1a] shadow-[8px_8px_0px_#00FFCC]";

function PreviewSlideImage({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!src.startsWith("http") || failed) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] via-jojo-purple/30 to-jojo-cyan/20"
        role="img"
        aria-label={alt}
      >
        <span className="border-4 border-[#00ffcc] bg-black px-4 py-2 text-sm font-black uppercase text-[#00ffcc]">
          {failed ? "Image failed" : "No image"}
        </span>
      </div>
    );
  }

  return (
    // Native img — avoid next/image fill + %-height on iOS
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      decoding="async"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      referrerPolicy="no-referrer"
      className="absolute inset-0 block h-full w-full object-cover object-center"
      onError={() => setFailed(true)}
    />
  );
}

export function CharacterPreviewScroller({
  characterSet,
}: CharacterPreviewScrollerProps) {
  const slides = Array.from({ length: CHARACTER_SLOT_COUNT + 1 }, (_, i) => i);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <GalleryTopNav
        centerLabel={characterSet.display_name}
        showJoinTier
        joinHref={characterSet.unlock_url}
        backHref="/gallery"
        backLabel="BACK TO HUB"
      />

      <div
        className="min-h-0 flex-1 snap-y snap-mandatory overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label={`${characterSet.display_name} preview gallery`}
      >
        {slides.map((index) => (
          <section key={index} className={SLIDE}>
            {index < CHARACTER_SLOT_COUNT ? (
              <div className={FRAME}>
                <PreviewSlideImage
                  src={characterSet.preview_images[index] ?? ""}
                  alt={`${characterSet.display_name} ${index + 1}`}
                  priority={index < 2}
                />
                <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 border-2 border-black bg-black/70 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/70">
                  {index + 1} / {CHARACTER_SLOT_COUNT + 1}
                </div>
              </div>
            ) : (
              <div className={FRAME}>
                <div className="absolute inset-0">
                  <PaywallCard unlockUrl={characterSet.unlock_url} />
                </div>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
