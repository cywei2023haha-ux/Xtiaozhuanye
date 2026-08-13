"use client";

import { FillImage } from "@/components/ui/FillImage";
import { GalleryTopNav } from "@/components/gallery/GalleryTopNav";
import { PaywallCard } from "@/components/gallery/PaywallCard";
import { CHARACTER_SLOT_COUNT } from "@/lib/character-storage";
import type { CharacterSet } from "@/lib/character-sets";

/**
 * Width capped by viewport; height from in-flow 9:16 pad lock (not aspect-ratio
 * alone). Absolute-only children inside aspect-ratio collapse to a “dot” on
 * mobile Safari / WeChat WebView — keep an in-flow sizer always.
 */
const FRAME_SHELL =
  "relative mx-auto w-[min(92vw,calc((100dvh-88px)*9/16))] max-w-full overflow-hidden border-4 border-black bg-[#1a1a1a] shadow-[8px_8px_0px_#00FFCC]";

/** 9/16 = 177.777…% — in-flow height lock */
const ASPECT_LOCK = "relative block w-full pb-[177.78%]";

const SLIDE =
  "flex h-[calc(100dvh-52px)] w-full shrink-0 snap-start snap-always items-center justify-center px-2 py-3";

type CharacterPreviewScrollerProps = {
  characterSet: CharacterSet;
};

export function CharacterPreviewScroller({
  characterSet,
}: CharacterPreviewScrollerProps) {
  const slides = Array.from({ length: CHARACTER_SLOT_COUNT + 1 }, (_, i) => i);

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <GalleryTopNav
        centerLabel={characterSet.display_name}
        showJoinTier
        joinHref={characterSet.unlock_url}
        backHref="/gallery"
        backLabel="BACK TO HUB"
      />

      <div
        className="h-[calc(100dvh-52px)] snap-y snap-mandatory overflow-y-auto overscroll-y-contain scroll-smooth [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label={`${characterSet.display_name} preview gallery`}
      >
        {slides.map((index) => (
          <section key={index} className={SLIDE}>
            {index < CHARACTER_SLOT_COUNT ? (
              <div className={FRAME_SHELL}>
                <div className={ASPECT_LOCK} aria-hidden={!characterSet.preview_images[index]}>
                  {characterSet.preview_images[index]?.startsWith("http") ? (
                    <FillImage
                      src={characterSet.preview_images[index]}
                      alt={`${characterSet.display_name} ${index + 1}`}
                      className="absolute inset-0"
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
                </div>
                <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 border-2 border-black bg-black/70 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/70">
                  {index + 1} / {CHARACTER_SLOT_COUNT + 1}
                </div>
              </div>
            ) : (
              <div className={FRAME_SHELL}>
                <div className={ASPECT_LOCK}>
                  <div className="absolute inset-0">
                    <PaywallCard unlockUrl={characterSet.unlock_url} />
                  </div>
                </div>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
