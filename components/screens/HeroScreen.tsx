"use client";

import { FillImage } from "@/components/ui/FillImage";
import { TrackedJojoCard } from "@/components/ui/TrackedJojoCard";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { useFeaturedGallery } from "@/hooks/useFeaturedGallery";
import { LINKS, SITE } from "@/lib/config";

export function HeroScreen({ className = "" }: { className?: string }) {
  const { loading, heroBackground, heroAvatar } = useFeaturedGallery();

  return (
    <ScreenShell
      id="hero"
      label="THE PRIVATE ARCHIVE"
      className={`overflow-hidden p-0 sm:px-0 ${className}`}
      bleed
    >
      <div className="relative flex min-h-[100dvh] flex-col">
        <div className="absolute inset-0">
          {heroBackground ? (
            <FillImage
              src={heroBackground.r2_url}
              alt="Hero background"
              priority
              className="h-full w-full"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-jojo-yellow via-jojo-purple to-black" />
          )}
          <div className="absolute inset-0 bg-black/45" />
        </div>

        <div className="relative z-10 flex min-h-[100dvh] flex-col justify-between gap-8 px-4 py-8 sm:px-6">
          <span className="inline-block w-fit border-2 border-black bg-jojo-yellow px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-black">
            THE PRIVATE ARCHIVE
          </span>

          <header className="space-y-4 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-white/70">
              CONTINUE TO PREMIUM FEED
            </p>
            <h1 className="text-[clamp(2rem,10vw,4.5rem)] font-black uppercase leading-[0.9] tracking-tighter drop-shadow-[4px_4px_0_#000]">
              <span className="block text-jojo-yellow">The</span>
              <span className="block text-jojo-purple">Best Part</span>
              <span className="block">Is Inside</span>
            </h1>
            <p className="max-w-xs text-sm font-medium uppercase tracking-wide text-white/80">
              {loading
                ? "Shuffling visuals…"
                : "Daily updated creator content stream"}
            </p>
          </header>

          <div className="flex items-end gap-5">
            <div className="relative h-24 w-24 shrink-0 border-4 border-black shadow-[8px_8px_0px_#00FFCC] sm:h-28 sm:w-28">
              <div className="relative h-full w-full overflow-hidden">
                {heroAvatar ? (
                  <FillImage src={heroAvatar.r2_url} alt="Profile avatar" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-jojo-yellow via-jojo-purple to-jojo-cyan" />
                )}
              </div>
              <span className="absolute bottom-1 right-1 z-10 inline-flex min-h-[18px] items-center justify-center border-2 border-black bg-jojo-cyan px-2 py-0.5 text-[9px] font-black uppercase leading-none text-black sm:bottom-1.5 sm:right-1.5 sm:min-h-[20px] sm:text-[10px]">
                Live
              </span>
            </div>
            <div className="text-white">
              <p className="text-lg font-black uppercase">{SITE.handle}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-white/60">
                Join My Patreon
              </p>
            </div>
          </div>

          <TrackedJojoCard
            href={LINKS.fanClub}
            medium="fanclub"
            hover="invert"
            className="group mt-auto bg-jojo-yellow p-6 sm:p-8"
          >
            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.3em]">
              Continuous Content Update Stream
            </p>
            <p className="mb-3 text-2xl font-black uppercase leading-none sm:text-3xl">
              Unlock Full
              <br />
              <span className="text-jojo-purple">Uncensored</span> Access
            </p>
            <p className="mb-4 text-sm font-medium text-black/70">
              Access exclusive sets not available on social platforms
            </p>
            <span className="inline-block border-4 border-black bg-black px-5 py-2 text-sm font-black uppercase text-jojo-cyan transition-colors group-hover:bg-jojo-purple group-hover:text-white">
              Enter Private Hub →
            </span>
          </TrackedJojoCard>
        </div>
      </div>
    </ScreenShell>
  );
}
