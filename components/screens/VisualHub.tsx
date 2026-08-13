"use client";

import { CharacterWaterfall } from "@/components/gallery/CharacterWaterfall";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { useCharacterSetsFeed } from "@/hooks/useCharacterSetsFeed";

export function VisualHub({ className = "" }: { className?: string }) {
  const { items, loading, hasMore, sentinelRef } = useCharacterSetsFeed({
    shuffle: true,
  });

  return (
    <ScreenShell
      id="visual-hub"
      label="CHARACTER SELECTION HUB"
      dark
      className={className}
      contentClassName="gap-0"
    >
      <CharacterWaterfall
        items={items}
        loading={loading}
        hasMore={hasMore}
        embedded
      />
      <div ref={sentinelRef} className="h-1" aria-hidden />
    </ScreenShell>
  );
}
