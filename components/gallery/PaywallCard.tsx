"use client";

import { useRefTracker } from "@/hooks/useRefTracker";

type PaywallCardProps = {
  unlockUrl: string;
};

export function PaywallCard({ unlockUrl }: PaywallCardProps) {
  const { appendRef } = useRefTracker();

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black p-6">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-jojo-purple/20 via-transparent to-jojo-cyan/15"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-8 rounded-sm border-2 border-[#00ffcc]/30"
        aria-hidden
      />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center border-2 border-[#00ffcc] bg-black/80 p-8 text-center shadow-[0_0_32px_rgba(0,255,204,0.25)] backdrop-blur-md">
        <span
          className="mb-5 flex h-16 w-16 items-center justify-center border-4 border-[#00ffcc] bg-black shadow-[0_0_20px_rgba(0,255,204,0.4)]"
          aria-hidden
        >
          <svg
            viewBox="0 0 24 24"
            className="h-8 w-8 text-[#00ffcc]"
            fill="currentColor"
          >
            <path d="M17 8h-1V6a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zm-3 0H10V6a2 2 0 1 1 4 0v2z" />
          </svg>
        </span>

        <p className="text-lg font-black uppercase leading-tight tracking-wide text-white sm:text-xl">
          Unlock Full Uncensored Access
        </p>
        <p className="mt-3 text-sm font-medium leading-relaxed text-white/60">
          Gain immediate access to 100+ ultra-high-res 4K source files of this
          set.
        </p>

        <a
          href={appendRef(unlockUrl, "gallery_paywall")}
          target="_blank"
          rel="noopener noreferrer"
          className="jojo-pulse-btn mt-8 w-full border-4 border-black bg-jojo-yellow px-6 py-4 text-base font-black uppercase text-black shadow-[8px_8px_0px_#00FFCC] transition-transform hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_#D600FF] sm:text-lg"
        >
          ⚡ Unlock Now
        </a>
      </div>
    </div>
  );
}
