"use client";

import { ProductTagForm } from "@/components/admin/ProductTagForm";
import { adminFetch } from "@/lib/admin-client";
import type { ArchiveImage, AssociatedProduct } from "@/lib/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type ImageTaggerProps = {
  imageId: string;
};

export function ImageTagger({ imageId }: ImageTaggerProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<ArchiveImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [clickPosition, setClickPosition] = useState<{ x: string; y: string } | null>(
    null,
  );
  const [editingProduct, setEditingProduct] = useState<AssociatedProduct | null>(
    null,
  );

  const loadImage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch(`/api/admin/images/${encodeURIComponent(imageId)}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to load image");
      }
      const data = await res.json();
      setImage(data.item);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, [imageId]);

  useEffect(() => {
    loadImage();
  }, [loadImage]);

  const saveProducts = async (products: AssociatedProduct[]) => {
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const res = await adminFetch(
        `/api/admin/images/${encodeURIComponent(imageId)}`,
        {
          method: "PATCH",
          body: JSON.stringify({ associated_products: products }),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Save failed");
      }

      const data = await res.json();
      setImage(data.item);
      setMessage("Tags saved to Supabase ✓");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setEditingProduct(null);
    setClickPosition({
      x: `${Math.round(x * 10) / 10}%`,
      y: `${Math.round(y * 10) / 10}%`,
    });
    setFormOpen(true);
  };

  const handleSaveTag = (product: AssociatedProduct) => {
    if (!image) return;

    const existing = image.associated_products.filter(
      (p) => p.product_id !== product.product_id,
    );
    const next = [...existing, product];
    setFormOpen(false);
    setClickPosition(null);
    setEditingProduct(null);
    saveProducts(next);
  };

  const removeTag = (productId: string) => {
    if (!image) return;
    saveProducts(image.associated_products.filter((p) => p.product_id !== productId));
  };

  const editTag = (product: AssociatedProduct) => {
    setEditingProduct(product);
    setClickPosition({ x: product.position_x, y: product.position_y });
    setFormOpen(true);
  };

  const deleteImage = async () => {
    if (
      !window.confirm(
        `Delete "${imageId}" from archive? The site will stop referencing it after refresh.`,
      )
    ) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const res = await adminFetch(
        `/api/admin/images/${encodeURIComponent(imageId)}`,
        { method: "DELETE" },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Delete failed");
      }

      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <p className="py-12 text-center text-sm font-black uppercase tracking-widest text-black/40">
        Loading image…
      </p>
    );
  }

  if (error && !image) {
    return (
      <div className="border-4 border-black bg-red-100 p-6 text-sm">
        <p className="font-black uppercase">{error}</p>
        <a href="/admin" className="mt-3 inline-block text-xs font-bold underline">
          ← Back to admin
        </a>
      </div>
    );
  }

  if (!image) return null;

  const isRemote = image.r2_url.startsWith("http");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase">{image.image_id}</h1>
          <p className="mt-1 text-xs text-black/50">
            Click anywhere on the image to add a product tag
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/admin/upload"
            className="border-4 border-black bg-white px-4 py-2 text-xs font-black uppercase"
          >
            Upload More
          </a>
          <a
            href="/admin"
            className="border-4 border-black bg-jojo-yellow px-4 py-2 text-xs font-black uppercase"
          >
            All Images
          </a>
          <button
            type="button"
            onClick={deleteImage}
            disabled={deleting || saving}
            className="border-4 border-black bg-red-100 px-4 py-2 text-xs font-black uppercase disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete Image"}
          </button>
        </div>
      </div>

      {message && (
        <p className="border-4 border-black bg-jojo-cyan px-4 py-2 text-xs font-black uppercase">
          {message}
        </p>
      )}
      {error && (
        <p className="border-4 border-black bg-red-100 px-4 py-2 text-xs font-bold">
          {error}
        </p>
      )}

      <div
        ref={containerRef}
        onClick={handleImageClick}
        className="relative cursor-crosshair overflow-hidden border-4 border-black bg-[#1a1a1a] shadow-[8px_8px_0px_#D600FF]"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
          }
        }}
        aria-label="Click to add product tag"
      >
        {isRemote ? (
          <Image
            src={image.r2_url}
            alt={image.image_id}
            width={1200}
            height={900}
            className="h-auto w-full object-contain"
            unoptimized
          />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-jojo-yellow to-jojo-purple text-white">
            <p className="text-sm font-black uppercase">Preview unavailable</p>
          </div>
        )}

        {image.associated_products.map((product) => (
          <button
            key={product.product_id}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              editTag(product);
            }}
            className="product-tag absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{ left: product.position_x, top: product.position_y }}
            title={product.name}
          >
            <span className="product-tag-ring product-tag-ring-1" aria-hidden />
            <span className="relative flex h-5 w-5 items-center justify-center border-2 border-black bg-jojo-cyan sm:h-6 sm:w-6">
              <span className="h-2 w-2 bg-black" />
            </span>
          </button>
        ))}
      </div>

      <div className="border-4 border-black bg-white p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40">
          Tagged Products ({image.associated_products.length})
        </p>
        {image.associated_products.length === 0 ? (
          <p className="mt-2 text-sm text-black/50">No tags yet — click the image above.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {image.associated_products.map((p) => (
              <li
                key={p.product_id}
                className="flex flex-wrap items-center justify-between gap-2 border-2 border-black/10 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-black uppercase">{p.name}</p>
                  <p className="text-xs text-black/50">
                    {p.price} · {p.position_x}, {p.position_y}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => editTag(p)}
                    className="border-2 border-black px-2 py-1 text-[10px] font-black uppercase"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => removeTag(p.product_id)}
                    disabled={saving}
                    className="border-2 border-black bg-red-100 px-2 py-1 text-[10px] font-black uppercase"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {saving && (
          <p className="mt-3 text-xs font-black uppercase text-jojo-purple">Saving…</p>
        )}
      </div>

      <ProductTagForm
        open={formOpen}
        position={clickPosition}
        initial={editingProduct ?? undefined}
        onSave={handleSaveTag}
        onClose={() => {
          setFormOpen(false);
          setClickPosition(null);
          setEditingProduct(null);
        }}
      />
    </div>
  );
}
