"use client";

import { GalleryTopNav } from "@/components/gallery/GalleryTopNav";
import { PaywallCard } from "@/components/gallery/PaywallCard";
import { CHARACTER_SLOT_COUNT } from "@/lib/character-storage";
import type { CharacterSet } from "@/lib/character-sets";
import type { CSSProperties, ReactNode } from "react";

/**
 * Critical for mobile (iOS / WeChat):
 * - Previous “wide line / 0 height” came from absolute-only children + invalid svh height.
 * - Preview image must stay IN DOCUMENT FLOW so the frame gets real height.
 * - object-fit:cover on a 9:16 in-flow box crops landscape (e.g. 1664×1080) L/R.
 */
const FRAME_CLASS =
  "relative mx-auto w-[92vw] max-w-full overflow-hidden border-4 border-black bg-[#1a1a1a] shadow-[8px_8px_0px_#00FFCC]";

const IMG_STYLE: CSSProperties = {
  display: "block",
  width: "100%",
  height: "auto",
  aspectRatio: "9 / 16",
  objectFit: "cover",
  objectPosition: "center",
  maxWidth: "none",
};

const SLIDE =
  "box-border flex w-full shrink-0 snap-start snap-always items-center justify-center px-2 py-3 min-h-[100vh] min-h-[100svh]";

type CharacterPreviewScrollerProps = {
  characterSet: CharacterSet;
};

function FrameShell({ children }: { children: ReactNode }) {
  return <div className={FRAME_CLASS}>{children}</div>;
}

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
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      decoding="async"
      loading="eager"
      fetchPriority={priority ? "high" : "auto"}
      referrerPolicy="no-referrer"
      style={IMG_STYLE}
    />
  );
}

function EmptyPreview({ label }: { label: string }) {
  return (
    <div
      className="flex w-full items-center justify-center bg-gradient-to-br from-[#1a1a1a] via-jojo-purple/30 to-jojo-cyan/20"
      style={{ aspectRatio: "9 / 16" }}
      role="img"
      aria-label={label}
    >
      <span className="border-4 border-[#00ffcc] bg-black px-4 py-2 text-sm font-black uppercase text-[#00ffcc]">
        {label}
      </span>
    </div>
  );
}

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
        className="min-h-0 flex-1 snap-y snap-mandatory overflow-y-auto overscroll-y-contain scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: "touch" }}
        aria-label={`${characterSet.display_name} preview gallery`}
      >
        {slides.map((index) => (
          <section key={index} className={SLIDE}>
            <FrameShell>
              {index < CHARACTER_SLOT_COUNT ? (
                <>
                  {characterSet.preview_images[index]?.startsWith("http") ? (
                    <PreviewImage
                      src={characterSet.preview_images[index]}
                      alt={`${characterSet.display_name} ${index + 1}`}
                      priority={index < 2}
                    />
                  ) : (
                    <EmptyPreview
                      label={`Preview ${String(index + 1).padStart(2, "0")}`}
                    />
                  )}
                  <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 border-2 border-black bg-black/70 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/70">
                    {index + 1} / {CHARACTER_SLOT_COUNT + 1}
                  </div>
                </>
              ) : (
                <div className="w-full" style={{ aspectRatio: "9 / 16" }}>
                  <PaywallCard unlockUrl={characterSet.unlock_url} />
                </div>
              )}
            </FrameShell>
          </section>
        ))}
      </div>
    </div>
  );
}
