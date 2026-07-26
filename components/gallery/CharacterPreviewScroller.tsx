"use client";

import { FillImage } from "@/components/ui/FillImage";
import { GalleryTopNav } from "@/components/gallery/GalleryTopNav";
import { PaywallCard } from "@/components/gallery/PaywallCard";
import { CHARACTER_SLOT_COUNT } from "@/lib/character-storage";
import type { CharacterSet } from "@/lib/character-sets";

/** 与第二屏 / 瀑布流一致的 9:16 竖屏画框 */
const PORTRAIT_FRAME =
  "relative mx-auto aspect-[9/16] w-[min(100%,calc((100dvh-80px)*9/16))] max-h-[calc(100dvh-80px)] overflow-hidden border-4 border-black bg-[#1a1a1a] shadow-[8px_8px_0px_#00FFCC]";

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
        className="h-[calc(100dvh-52px)] snap-y snap-mandatory overflow-y-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label={`${characterSet.display_name} preview gallery`}
      >
        {slides.map((index) => (
          <section
            key={index}
            className="flex h-[calc(100dvh-52px)] w-full snap-start snap-always items-center justify-center px-2 py-3"
          >
            {index < CHARACTER_SLOT_COUNT ? (
              <div className={PORTRAIT_FRAME}>
                {characterSet.preview_images[index]?.startsWith("http") ? (
                  <FillImage
                    src={characterSet.preview_images[index]}
                    alt={`${characterSet.display_name} ${index + 1}`}
                    priority={index === 0}
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a1a1a] via-jojo-purple/30 to-jojo-cyan/20"
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
