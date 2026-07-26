"use client";

import { useState } from "react";
import { ProductBubble } from "@/components/ProductBubble";
import { ProductTag } from "@/components/ProductTag";
import { JojoCard } from "@/components/ui/JojoCard";
import { getMockGradient } from "@/lib/mock-images";
import type { ArchiveImage, AssociatedProduct } from "@/lib/types";
import Image from "next/image";

type ImageArchiveCardProps = {
  image: ArchiveImage;
  index: number;
};

export function ImageArchiveCard({ image, index }: ImageArchiveCardProps) {
  const [activeProduct, setActiveProduct] = useState<AssociatedProduct | null>(
    null,
  );
  const gradient = getMockGradient(image.r2_url);
  const isRemoteImage = image.r2_url.startsWith("http");

  return (
    <JojoCard hover="none" className="overflow-hidden p-0">
      <div className="relative aspect-[4/5] w-full bg-[#1a1a1a] sm:aspect-[16/10]">
        {isRemoteImage ? (
          <Image
            src={image.r2_url}
            alt={image.image_id}
            fill
            className={`object-cover ${image.is_locked ? "blur-md" : ""}`}
            sizes="(max-width: 768px) 100vw, 80vw"
            priority={index < 2}
          />
        ) : (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${
              gradient ?? "from-jojo-yellow to-jojo-purple"
            } ${image.is_locked ? "blur-md" : ""}`}
          />
        )}

        {image.is_locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/25">
            <span className="border-4 border-black bg-jojo-cyan px-4 py-2 text-sm font-black uppercase shadow-[4px_4px_0px_#D600FF]">
              🔒 Locked
            </span>
          </div>
        )}

        {!image.is_locked &&
          image.associated_products.map((product) => (
            <ProductTag
              key={product.product_id}
              product={product}
              active={activeProduct?.product_id === product.product_id}
              onSelect={setActiveProduct}
            />
          ))}

        {activeProduct && !image.is_locked && (
          <ProductBubble
            product={activeProduct}
            onClose={() => setActiveProduct(null)}
          />
        )}
      </div>

      <div className="flex items-center justify-between border-t-4 border-black bg-white px-4 py-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">
            Archive #{String(index + 1).padStart(3, "0")}
          </p>
          <p className="text-xs font-black uppercase">{image.image_id}</p>
        </div>
        {image.associated_products.length > 0 && (
          <span className="border-2 border-black bg-jojo-cyan px-2 py-1 text-[9px] font-black uppercase">
            {image.associated_products.length} Tag
            {image.associated_products.length > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </JojoCard>
  );
}
