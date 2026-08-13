"use client";

import { GalleryTopNav } from "@/components/gallery/GalleryTopNav";
import { PaywallCard } from "@/components/gallery/PaywallCard";
import { CHARACTER_SLOT_COUNT } from "@/lib/character-storage";
import type { CharacterSet } from "@/lib/character-sets";
import type { CSSProperties } from "react";

/**
 * Mobile-safe portrait frame.
 * Do NOT put percentage padding-bottom / aspect-ratio directly on a flex item —
 * iOS Safari / WeChat resolve % padding against height → 0 → collapses to a “dot”.
 * Use explicit width + height from svh instead.
 */
const FRAME_STYLE: CSSProperties = {
  width: "min(92vw, calc((100svh - 88px) * 9 / 16))",
  height: "calc(100svh - 88px)",
  maxWidth: "100%",
};

const SLIDE =
  "box-border flex h-[calc(100svh-52px)] w-full shrink-0 snap-start snap-always items-center justify-center px-2 py-3";

type CharacterPreviewScrollerProps = {
  characterSet: CharacterSet;
};

function PreviewImage({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    // Native img — avoid nested absolute wrappers that collapse on mobile WebViews
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      decoding="async"
      loading="eager"
      fetchPriority={priority ? "high" : "auto"}
      referrerPolicy="no-referrer"
      className="absolute inset-0 h-full w-full max-w-none object-cover object-center"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center",
      }}
    />
  );
}

export function CharacterPreviewScroller({
  characterSet,
}: CharacterPreviewScrollerProps) {
  const slides = Array.from({ length: CHARACTER_SLOT_COUNT + 1 }, (_, i) => i);

  return (
    <div className="flex min-h-[100svh] flex-col bg-black">
      <GalleryTopNav
        centerLabel={characterSet.display_name}
        showJoinTier
        joinHref={characterSet.unlock_url}
        backHref="/gallery"
        backLabel="BACK TO HUB"
      />

      <div
        className="h-[calc(100svh-52px)] snap-y snap-mandatory overflow-y-auto overscroll-y-contain scroll-smooth [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label={`${characterSet.display_name} preview gallery`}
      >
        {slides.map((index) => (
          <section key={index} className={SLIDE}>
            {/* Block wrapper: flex item has real width; media lives inside, not as flex+%pad */}
            <div
              className="mx-auto w-full max-w-full shrink-0"
              style={{ maxWidth: FRAME_STYLE.width }}
            >
              <div
                className="relative overflow-hidden border-4 border-black bg-[#1a1a1a] shadow-[8px_8px_0px_#00FFCC]"
                style={FRAME_STYLE}
              >
                {index < CHARACTER_SLOT_COUNT ? (
                  <>
                    {characterSet.preview_images[index]?.startsWith("http") ? (
                      <PreviewImage
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
                  </>
                ) : (
                  <PaywallCard unlockUrl={characterSet.unlock_url} />
                )}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
