"use client";

import { FillImage } from "@/components/ui/FillImage";
import { JojoCard } from "@/components/ui/JojoCard";
import { getCharacterCoverUrl, type CharacterSet } from "@/lib/character-sets";
import Link from "next/link";

/** 竖版封面槽：用 padding 锁 9:16，避免手机端 aspect+纯绝对定位塌缩 */
const PORTRAIT_CELL =
  "relative mx-auto w-full max-w-full overflow-hidden";

type CharacterWaterfallProps = {
  items: CharacterSet[];
  loading: boolean;
  hasMore: boolean;
  /** 嵌在首页 ScreenShell 内时去掉外层多余 padding */
  embedded?: boolean;
};

function CharacterCell({ set }: { set: CharacterSet }) {
  const cover = getCharacterCoverUrl(set);

  return (
    <Link href={`/gallery/${set.set_id}`} className="block min-w-0 no-underline">
      <JojoCard hover="lift" className={`${PORTRAIT_CELL} bg-[#1a1a1a] p-0`}>
        <div className="relative block w-full pb-[177.78%]">
          {cover ? (
            <FillImage
              src={cover}
              alt={set.display_name}
              className="absolute inset-0"
            />
          ) : (
            <div
              className="absolute inset-0 bg-gradient-to-br from-jojo-yellow via-jojo-purple to-jojo-cyan"
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

export function CharacterWaterfall({
  items,
  loading,
  hasMore,
  embedded = false,
}: CharacterWaterfallProps) {
  const headerPad = embedded ? "pt-0" : "px-4 pt-6 sm:px-6";
  const gridPad = embedded ? "pb-4" : "px-3 pb-8 sm:px-4";
  const footerPad = embedded ? "pb-4" : "px-4 pb-10";

  return (
    <div className="flex flex-col gap-4">
      <div className={`shrink-0 ${headerPad}`}>
        <h2 className="text-3xl font-black uppercase leading-none text-white sm:text-4xl">
          View{" "}
          <span className="text-jojo-purple">All Profiles</span>
        </h2>
        <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-white/60">
          Each character contains extended private visual collections.
          <br />
          Tap a profile to preview the full set.
        </p>
      </div>

      <div
        className={`grid grid-cols-2 auto-rows-auto gap-2 sm:gap-3 ${gridPad}`}
      >
        {items.map((set) => (
          <div key={set.set_id} className="min-w-0 p-0.5">
            <CharacterCell set={set} />
          </div>
        ))}
      </div>

      {(loading || hasMore) && (
        <div className={`flex justify-center ${footerPad}`}>
          <p className="border-4 border-dashed border-white/20 px-6 py-4 text-center text-xs font-black uppercase tracking-wider text-white/50">
            {loading ? "Loading more profiles…" : "Scroll for more"}
          </p>
        </div>
      )}

      {!loading && items.length === 0 && (
        <p className={`text-center text-sm font-bold text-white/50 ${footerPad}`}>
          No character sets yet. Upload via Admin → Characters.
        </p>
      )}
    </div>
  );
}
