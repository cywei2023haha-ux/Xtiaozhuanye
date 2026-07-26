"use client";

import { TrackedJojoCard } from "@/components/ui/TrackedJojoCard";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { LINKS } from "@/lib/config";
import { getKinkAcademyLink } from "@/lib/kink-academy-links";
import {
  KINK_ACADEMY_MODULES,
  KINK_ACADEMY_VISIBLE_COUNT,
} from "@/lib/kink-academy-modules";

export function KinkAcademy({ className = "" }: { className?: string }) {
  return (
    <ScreenShell
      id="kink-academy"
      label="Swipe through structured module previews"
      dark
      className={`leather-texture ${className}`}
      contentClassName="gap-5"
    >
      <div className="flex flex-col gap-5">
        <header className="shrink-0">
          <h2 className="text-[clamp(1.65rem,7vw,3rem)] font-black uppercase leading-[0.9] tracking-tight">
            Digital Content
            <br />
            <span className="text-jojo-cyan">Academy</span>
          </h2>
          <p className="mt-3 max-w-sm text-sm font-medium leading-relaxed text-white/60">
            Full downloadable premium content library available after entry
          </p>
        </header>

        <div className="relative">
          <div
            className="academy-list-scroll overflow-y-auto overscroll-contain scroll-smooth pr-1 [scrollbar-color:#00ffcc_#1a1a1a] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-jojo-cyan [&::-webkit-scrollbar-track]:bg-white/10"
            aria-label="Academy modules list"
          >
            <ul className="flex flex-col gap-2">
              {KINK_ACADEMY_MODULES.map((mod) => (
                <li key={mod.num} className="shrink-0 snap-start">
                  <TrackedJojoCard
                    href={getKinkAcademyLink(mod.num)}
                    medium="academy"
                    hover="invert"
                    className="group text-black shadow-[8px_8px_0px_#D600FF]"
                  >
                    <div className="flex items-start gap-2.5 p-3 sm:gap-3 sm:p-3.5">
                      <span className="shrink-0 border-2 border-black bg-jojo-yellow px-1.5 py-0.5 text-[10px] font-black leading-none text-black group-hover:bg-jojo-cyan group-hover:text-black sm:px-2 sm:py-1 sm:text-xs">
                        {mod.num}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-black uppercase leading-tight text-black sm:text-base">
                          {mod.title}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-[11px] font-medium leading-snug text-black/55 group-hover:text-white/50 sm:text-xs">
                          {mod.desc}
                        </p>
                      </div>
                    </div>
                  </TrackedJojoCard>
                </li>
              ))}
            </ul>
          </div>

          {KINK_ACADEMY_MODULES.length > KINK_ACADEMY_VISIBLE_COUNT && (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#1a1a1a] to-transparent"
              aria-hidden
            />
          )}
        </div>

        <TrackedJojoCard
          href={LINKS.academy}
          medium="academy"
          hover="lift"
          className="shrink-0 border-jojo-purple bg-jojo-purple p-5 text-white shadow-[8px_8px_0px_#00FFCC] sm:p-6"
        >
          <p className="text-xs font-black uppercase tracking-[0.25em] sm:text-sm">
            <span className="text-black">Full Academy Access - </span>
            <span className="bg-white px-1.5 py-0.5 text-jojo-purple">
              50% Introduction Rate
            </span>
          </p>
          <p className="mt-1 text-xl font-black uppercase sm:text-2xl">
            Enter The Academy
          </p>
        </TrackedJojoCard>
      </div>
    </ScreenShell>
  );
}
