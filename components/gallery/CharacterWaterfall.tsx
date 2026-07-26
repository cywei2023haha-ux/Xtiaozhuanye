"use client";

import { FillImage } from "@/components/ui/FillImage";
import { JojoCard } from "@/components/ui/JojoCard";
import { getCharacterCoverUrl, type CharacterSet } from "@/lib/character-sets";
import Link from "next/link";

const PORTRAIT_CELL =
  "relative mx-auto w-[calc(100%-6px)] max-w-full aspect-[9/16] overflow-hidden";

type CharacterWaterfallProps = {
  items: CharacterSet[];
  loading: boolean;
  hasMore: boolean;
};

function CharacterCell({ set }: { set: CharacterSet }) {
  const cover = getCharacterCoverUrl(set);

  return (
    <Link href={`/gallery/${set.set_id}`} className="block no-underline">
      <JojoCard hover="lift" className={`${PORTRAIT_CELL} bg-[#1a1a1a] p-0`}>
        <div className="absolute inset-0">
          {cover ? (
            <FillImage src={cover} alt={set.display_name} />
          ) : (
            <div
              className="h-full w-full bg-gradient-to-br from-jojo-yellow via-jojo-purple to-jojo-cyan"
              role="img"
              aria-label={set.display_name}
            />
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-10 border-t-4 border-black bg-black/85 px-2 py-2">
          <p className="truncate text-[9px] font-black uppercase tracking-wider text-jojo-cyan sm:text-[10px]">
            {set.display_name}
          </p>
        </div>
      </JojoCard>
    </Link>
  );
}

export function CharacterWaterfall({ items, loading, hasMore }: CharacterWaterfallProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="shrink-0 px-4 pt-6 sm:px-6">
        <h1 className="text-3xl font-black uppercase leading-none text-white sm:text-4xl">
          View{" "}
          <span className="text-jojo-purple">All Profiles</span>
        </h1>
        <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-white/60">
          Each character contains extended private visual collections.
          <br />
          Tap a profile to preview the full set.
        </p>
      </div>

      <div className="grid grid-cols-2 auto-rows-auto gap-2 px-3 pb-8 sm:gap-3 sm:px-4">
        {items.map((set) => (
          <div key={set.set_id} className="p-0.5">
            <CharacterCell set={set} />
          </div>
        ))}
      </div>

      {(loading || hasMore) && (
        <div className="flex justify-center px-4 pb-10">
          <p className="border-4 border-dashed border-white/20 px-6 py-4 text-xs font-black uppercase tracking-wider text-white/50">
            {loading ? "Loading more profiles…" : "Scroll for more"}
          </p>
        </div>
      )}

      {!loading && items.length === 0 && (
        <p className="px-4 pb-10 text-center text-sm font-bold text-white/50">
          No character sets yet. Upload via Admin → Characters.
        </p>
      )}
    </div>
  );
}
