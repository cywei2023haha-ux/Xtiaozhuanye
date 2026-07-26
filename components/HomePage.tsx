"use client";

import { ArchiveGallerySection, GearShop } from "@/components/screens/GearShop";
import { HeroScreen } from "@/components/screens/HeroScreen";
import { KinkAcademy } from "@/components/screens/KinkAcademy";
import { VisualHub } from "@/components/screens/VisualHub";
import { FeaturedGalleryProvider } from "@/hooks/useFeaturedGallery";
import { GalleryProvider } from "@/hooks/useGallery";
import { RefTrackerProvider } from "@/hooks/useRefTracker";

export function HomePage() {
  return (
    <RefTrackerProvider>
      <FeaturedGalleryProvider>
        <GalleryProvider>
        <main className="bg-white">
          <div className="site-canvas mx-auto flex w-full flex-col">
            <HeroScreen />
            <VisualHub />
            <KinkAcademy />
            <GearShop />
          </div>
          <div className="site-canvas mx-auto w-full">
            <ArchiveGallerySection />
          </div>
        </main>
        </GalleryProvider>
      </FeaturedGalleryProvider>
    </RefTrackerProvider>
  );
}
