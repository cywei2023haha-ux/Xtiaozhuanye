import Link from "next/link";
import { LINKS } from "@/lib/config";

type GalleryTopNavProps = {
  centerLabel?: string;
  showJoinTier?: boolean;
  joinHref?: string;
  backHref?: string;
  backLabel?: string;
};

export function GalleryTopNav({
  centerLabel = "GALLERY",
  showJoinTier = false,
  joinHref = LINKS.fanClub,
  backHref = "/",
  backLabel = "BACK TO HUB",
}: GalleryTopNavProps) {
  return (
    <header className="sticky top-0 z-40 border-b-4 border-black bg-black text-white">
      <div className="site-canvas mx-auto flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href={backHref}
          className="shrink-0 text-[10px] font-black uppercase tracking-[0.2em] text-jojo-cyan transition-colors hover:text-jojo-yellow sm:text-xs"
        >
          {backLabel}
        </Link>

        <p className="min-w-0 truncate text-center text-[10px] font-black uppercase tracking-[0.25em] sm:text-xs">
          <span className="text-jojo-cyan">ASTRABLOOM</span>
          <span className="text-white/40">:</span>
          <span className="text-white"> {centerLabel}</span>
        </p>

        {showJoinTier ? (
          <a
            href={joinHref}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 border-2 border-[#00ffcc] bg-black px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[#00ffcc] shadow-[0_0_12px_rgba(0,255,204,0.35)] transition-transform hover:-translate-y-0.5 sm:px-3 sm:text-xs"
          >
            JOIN TIER
          </a>
        ) : (
          <span className="w-[72px] shrink-0 sm:w-[88px]" aria-hidden />
        )}
      </div>
    </header>
  );
}
