"use client";

import { VirtualGallery } from "@/components/VirtualGallery";
import { FillImage } from "@/components/ui/FillImage";
import { TrackedJojoCard } from "@/components/ui/TrackedJojoCard";
import { JojoCard } from "@/components/ui/JojoCard";
import { ScreenShell } from "@/components/ui/ScreenShell";
import { useGallery } from "@/hooks/useGallery";
import {
  GEAR_SHOP_HERO_LINK,
  getGearShopLink,
} from "@/lib/gear-shop-links";
import { formatUsdPrice } from "@/lib/format-price";
import type { ArchiveImage } from "@/lib/types";
import { useEffect, useState } from "react";

const FALLBACK_GEAR = [
  { name: "Leather Restraint Set", price: "$49.99" },
  { name: "Premium Impact Tools", price: "$39.99" },
  { name: "Scene Starter Kit", price: "$89.99" },
];

function gearLabel(item: ArchiveImage, index: number) {
  const product = item.associated_products[0];
  return {
    name: product?.name ?? `Gear Item ${index + 1}`,
    price: product?.price ?? "",
  };
}

export function GearShop({ className = "" }: { className?: string }) {
  const { galleryOpen, openGallery } = useGallery();
  const [gearItems, setGearItems] = useState<ArchiveImage[]>([]);

  useEffect(() => {
    fetch("/api/images/gear", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.items?.length) setGearItems(data.items);
      })
      .catch(() => {});
  }, []);

  const displayItems =
    gearItems.length > 0
      ? gearItems.slice(0, 3)
      : FALLBACK_GEAR.map((item, i) => ({
          image_id: `fallback_${i}`,
          r2_url: "",
          is_locked: false,
          sort_order: i,
          image_role: "gear" as const,
          associated_products: [
            {
              product_id: `fallback_${i}`,
              name: item.name,
              price: item.price,
              shop_url: "",
              position_x: "50%",
              position_y: "50%",
            },
          ],
        }));

  return (
    <ScreenShell id="gear-shop" label="CREATOR GEAR HUB" className={className}>
      <div className="flex flex-col gap-6">
        <TrackedJojoCard
          href={GEAR_SHOP_HERO_LINK}
          medium="gear"
          hover="invert"
          className="bg-jojo-yellow p-6 sm:p-8"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.35em]">
            Recreate The Visuals
          </p>
          <h2 className="mt-2 text-[clamp(2rem,10vw,4rem)] font-black uppercase leading-[0.85]">
            Buy The Full
            <br />
            Setup 🛒
          </h2>
          <p className="mt-3 max-w-md text-sm font-bold leading-relaxed tracking-wide">
            Each character scene includes matching gear and assets.
            <br />
            Explore full scene-based content kits.
          </p>
        </TrackedJojoCard>

        <div className="grid gap-3 sm:grid-cols-3">
          {displayItems.map((item, index) => {
            const { name, price } = gearLabel(item, index);
            const hasImage = item.r2_url.startsWith("http");

            return (
              <TrackedJojoCard
                key={item.image_id}
                href={getGearShopLink(
                  item.image_id,
                  item.associated_products[0]?.shop_url,
                )}
                medium="gear"
                hover="lift"
                className="p-4"
              >
                <div className="relative mb-3 aspect-square overflow-hidden border-4 border-black bg-gradient-to-br from-[#1a1a1a] to-jojo-yellow">
                  {hasImage && (
                    <FillImage src={item.r2_url} alt={name} imageClassName="object-cover" />
                  )}
                </div>
                <p className="text-xs font-black uppercase leading-tight">{name}</p>
                {price && (
                  <p className="mt-1 text-sm font-black text-jojo-purple">
                    {formatUsdPrice(price)}
                  </p>
                )}
              </TrackedJojoCard>
            );
          })}
        </div>

        <div className="space-y-3">
          {!galleryOpen ? (
            <button
              type="button"
              onClick={openGallery}
              className="jojo-pulse-btn w-full border-4 border-black bg-black px-6 py-4 text-sm font-black uppercase text-jojo-cyan shadow-[8px_8px_0px_#D600FF] transition-transform hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_#00FFCC] sm:text-base"
            >
              Load More Uncensored Visuals 🔄
            </button>
          ) : (
            <JojoCard hover="none" className="bg-jojo-cyan px-4 py-3 text-center text-xs font-black uppercase">
              Archive expanded below ↓
            </JojoCard>
          )}
        </div>
      </div>
    </ScreenShell>
  );
}

export function ArchiveGallerySection() {
  const { galleryOpen } = useGallery();
  if (!galleryOpen) return null;
  return <VirtualGallery />;
}
