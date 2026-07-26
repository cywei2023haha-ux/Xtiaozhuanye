"use client";

import { JojoCard } from "@/components/ui/JojoCard";
import { useRefTracker } from "@/hooks/useRefTracker";
import { formatUsdPrice } from "@/lib/format-price";
import type { AssociatedProduct } from "@/lib/types";

type ProductBubbleProps = {
  product: AssociatedProduct;
  onClose: () => void;
};

export function ProductBubble({ product, onClose }: ProductBubbleProps) {
  const { appendRef } = useRefTracker();

  return (
    <div
      className="absolute z-20 max-w-[220px] animate-comic-pop sm:max-w-[260px]"
      style={{
        left: product.position_x,
        top: product.position_y,
        transform: "translate(-50%, calc(-100% - 16px))",
      }}
      role="dialog"
      aria-label={`Product: ${product.name}`}
    >
      <div
        className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-r-2 border-b-2 border-black bg-jojo-yellow"
        aria-hidden
      />
      <JojoCard hover="none" className="bg-jojo-yellow p-3 sm:p-4">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-jojo-purple">
          Scene Gear
        </p>
        <p className="mt-1 text-sm font-black uppercase leading-tight">
          {product.name}
        </p>
        <p className="mt-1 text-lg font-black text-jojo-purple">
          {formatUsdPrice(product.price)}
        </p>
        <div className="mt-3 flex gap-2">
          <JojoCard
            as="a"
            href={appendRef(product.shop_url, "gear")}
            hover="invert"
            className="flex-1 bg-black px-2 py-2 text-center text-[10px] font-black uppercase text-jojo-cyan"
          >
            🛒 Equip Now
          </JojoCard>
          <JojoCard
            as="button"
            hover="lift"
            onClick={onClose}
            className="px-2 py-2 text-[10px] font-black uppercase"
          >
            ✕
          </JojoCard>
        </div>
      </JojoCard>
    </div>
  );
}
