"use client";

import { FillImage } from "@/components/ui/FillImage";
import { GalleryTopNav } from "@/components/gallery/GalleryTopNav";
import { PaywallCard } from "@/components/gallery/PaywallCard";
import { CHARACTER_SLOT_COUNT } from "@/lib/character-storage";
import type { CharacterSet } from "@/lib/character-sets";

/**
 * Height-first 9:16 frame.
 * Width-first + max-h + aspect-ratio often collapses to 0 height on iOS Safari,
 * so Next/Image `fill` renders invisible on phones while desktop Chromium looks fine.
 */
const PORTRAIT_FRAME =
  "relative h-full max-h-full w-auto max-w-full aspect-[9/16] overflow-hidden border-4 border-black bg-[#1a1a1a] shadow-[8px_8px_0px_#00FFCC]";

type CharacterPreviewScrollerProps = {
  characterSet: CharacterSet;
};

export function CharacterPreviewScroller({
  characterSet,
}: CharacterPreviewScrollerProps) {
  const slides = Array.from({ length: CHARACTER_SLOT_COUNT + 1 }, (_, i) => i);

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-black">
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
          <section
            key={index}
            className="flex h-full min-h-full w-full snap-start snap-always items-center justify-center px-2 py-2"
          >
            {index < CHARACTER_SLOT_COUNT ? (
              <div className={PORTRAIT_FRAME}>
                {characterSet.preview_images[index]?.startsWith("http") ? (
                  <FillImage
                    src={characterSet.preview_images[index]}
                    alt={`${characterSet.display_name} ${index + 1}`}
                    priority={index < 2}
                  />
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] via-jojo-purple/30 to-jojo-cyan/20"
                    role="img"
                    aria-label={`${characterSet.display_name} preview ${index + 1}`}
                  >
                    <span className="border-4 border-[#00ffcc] bg-black px-4 py-2 text-sm font-black uppercase text-[#00ffcc]">
                      Preview {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                )}
                <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 border-2 border-black bg-black/70 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/70">
                  {index + 1} / {CHARACTER_SLOT_COUNT + 1}
                </div>
              </div>
            ) : (
              <div className={PORTRAIT_FRAME}>
                <PaywallCard unlockUrl={characterSet.unlock_url} />
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
