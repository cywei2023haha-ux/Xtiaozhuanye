"use client";

import { CharacterWaterfall } from "@/components/gallery/CharacterWaterfall";
import { GalleryTopNav } from "@/components/gallery/GalleryTopNav";
import { useCharacterSetsFeed } from "@/hooks/useCharacterSetsFeed";

export function CharacterGalleryPage() {
  const { items, loading, hasMore, sentinelRef } = useCharacterSetsFeed();

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <GalleryTopNav backHref="/#visual-hub" backLabel="BACK TO HUB" />
      <div className="site-canvas mx-auto w-full">
        <CharacterWaterfall items={items} loading={loading} hasMore={hasMore} />
        <div ref={sentinelRef} className="h-1" aria-hidden />
      </div>
    </div>
  );
}
