"use client";

import type { AssociatedProduct } from "@/lib/types";
import { useEffect, useState } from "react";

type ProductTagFormProps = {
  open: boolean;
  position: { x: string; y: string } | null;
  initial?: Partial<AssociatedProduct>;
  onSave: (product: AssociatedProduct) => void;
  onClose: () => void;
};

const emptyForm = {
  product_id: "",
  name: "",
  price: "",
  shop_url: "",
};

export function ProductTagForm({
  open,
  position,
  initial,
  onSave,
  onClose,
}: ProductTagFormProps) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (open) {
      setForm({
        product_id: initial?.product_id ?? "",
        name: initial?.name ?? "",
        price: initial?.price ?? "",
        shop_url: initial?.shop_url ?? "",
      });
    }
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !position) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product_id || !form.name || !form.price || !form.shop_url) return;

    onSave({
      ...form,
      position_x: position.x,
      position_y: position.y,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-label="Close"
      />
      <form
        onSubmit={submit}
        className="relative z-10 w-full max-w-md border-4 border-black bg-jojo-yellow p-6 shadow-[8px_8px_0px_#00FFCC]"
      >
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-jojo-purple">
          Tag Product
        </p>
        <p className="mt-1 text-xs font-bold text-black/60">
          Position: {position.x}, {position.y}
        </p>

        <div className="mt-4 space-y-3">
          {(
            [
              ["product_id", "Product ID", "leather_whip_01"],
              ["name", "Product Name", "Handcrafted Leather Whip"],
              ["price", "Price", "$49.99"],
              ["shop_url", "Shop URL", "https://shop.example.com/product"],
            ] as const
          ).map(([key, label, placeholder]) => (
            <label key={key} className="block">
              <span className="text-[10px] font-black uppercase tracking-wider">
                {label}
              </span>
              <input
                required
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="mt-1 w-full border-4 border-black bg-white px-3 py-2 text-sm outline-none focus:shadow-[3px_3px_0px_#D600FF]"
              />
            </label>
          ))}
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="submit"
            className="flex-1 border-4 border-black bg-black py-2.5 text-xs font-black uppercase text-jojo-cyan"
          >
            Save Tag
          </button>
          <button
            type="button"
            onClick={onClose}
            className="border-4 border-black bg-white px-4 py-2.5 text-xs font-black uppercase"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
