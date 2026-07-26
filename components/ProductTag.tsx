"use client";

import type { AssociatedProduct } from "@/lib/types";

type ProductTagProps = {
  product: AssociatedProduct;
  onSelect: (product: AssociatedProduct) => void;
  active?: boolean;
};

export function ProductTag({ product, onSelect, active = false }: ProductTagProps) {
  return (
    <button
      type="button"
      aria-label={`View product: ${product.name}`}
      aria-pressed={active}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(product);
      }}
      className="product-tag group absolute z-10 -translate-x-1/2 -translate-y-1/2"
      style={{ left: product.position_x, top: product.position_y }}
    >
      <span className="product-tag-ring product-tag-ring-1" aria-hidden />
      <span className="product-tag-ring product-tag-ring-2" aria-hidden />
      <span
        className={`relative flex h-5 w-5 items-center justify-center border-2 border-black bg-jojo-cyan shadow-[2px_2px_0px_#000] transition-transform group-hover:scale-125 sm:h-6 sm:w-6 ${
          active ? "scale-125 bg-jojo-purple" : ""
        }`}
      >
        <span className="h-2 w-2 bg-black" />
      </span>
    </button>
  );
}
