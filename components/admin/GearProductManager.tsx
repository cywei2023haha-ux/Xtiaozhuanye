"use client";

import { adminFetch } from "@/lib/admin-client";
import { GEAR_SHOP_DEFAULT_LINK } from "@/lib/gear-shop-links";
import { formatUsdPrice } from "@/lib/format-price";
import type { ArchiveImage, AssociatedProduct } from "@/lib/types";
import { uploadFileToR2 } from "@/lib/upload-client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const MAX_SIZE_MB = 10;

type GearDraft = {
  name: string;
  price: string;
  shop_url: string;
};

function gearProduct(item: ArchiveImage): AssociatedProduct | null {
  return item.associated_products[0] ?? null;
}

function draftFromItem(item: ArchiveImage): GearDraft {
  const product = gearProduct(item);
  return {
    name: product?.name ?? "",
    price: product?.price ?? "",
    shop_url: product?.shop_url ?? "",
  };
}

export function GearProductManager() {
  const [items, setItems] = useState<ArchiveImage[]>([]);
  const [drafts, setDrafts] = useState<Record<string, GearDraft>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [productTitle, setProductTitle] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [shopLink, setShopLink] = useState("");

  const [savingId, setSavingId] = useState<string | null>(null);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/images");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to load gear products");
      }
      const data = await res.json();
      const gearItems = (data.items ?? []).filter(
        (item: ArchiveImage) => item.image_role === "gear",
      );
      setItems(gearItems);
      setDrafts(
        Object.fromEntries(
          gearItems.map((item: ArchiveImage) => [item.image_id, draftFromItem(item)]),
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const resetUploadForm = () => {
    setPendingFile(null);
    setPreview(null);
    setProductTitle("");
    setProductPrice("");
    setShopLink("");
    setProgress(null);
  };

  const uploadNewProduct = useCallback(
    async (file: File) => {
      const title = productTitle.trim();
      if (!title) {
        setError("Product title is required");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed");
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`File exceeds ${MAX_SIZE_MB}MB limit`);
        return;
      }

      setUploading(true);
      setError(null);
      setProgress("Requesting upload URL…");

      try {
        const presignRes = await adminFetch("/api/admin/upload", {
          method: "POST",
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
            imageRole: "gear",
          }),
        });

        if (!presignRes.ok) {
          const data = await presignRes.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to get upload URL");
        }

        const { uploadUrl, publicUrl, imageId } = await presignRes.json();

        setProgress("Uploading to R2 (gear/)…");
        await uploadFileToR2(uploadUrl, file);

        const resolvedLink = shopLink.trim() || GEAR_SHOP_DEFAULT_LINK;

        setProgress("Saving product…");
        const saveRes = await adminFetch("/api/admin/images", {
          method: "POST",
          body: JSON.stringify({
            image_id: imageId,
            r2_url: publicUrl,
            image_role: "gear",
            is_locked: false,
            associated_products: [
              {
                product_id: `gear_${imageId}`,
                name: title,
                price: productPrice.trim() || "",
                shop_url: resolvedLink,
                position_x: "50%",
                position_y: "50%",
              },
            ],
          }),
        });

        if (!saveRes.ok) {
          const data = await saveRes.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to save product");
        }

        setProgress("Product saved!");
        resetUploadForm();
        await loadProducts();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
        setProgress(null);
      } finally {
        setUploading(false);
      }
    },
    [loadProducts, productPrice, productTitle, shopLink],
  );

  const handleNewFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setPendingFile(file);
    setPreview(URL.createObjectURL(file));
    setError(null);
  };

  const updateDraft = (imageId: string, patch: Partial<GearDraft>) => {
    setDrafts((prev) => ({
      ...prev,
      [imageId]: { ...prev[imageId], ...patch },
    }));
  };

  const saveProduct = async (item: ArchiveImage) => {
    const draft = drafts[item.image_id];
    if (!draft?.name.trim()) {
      setError("Product title is required");
      return;
    }

    setSavingId(item.image_id);
    setError(null);

    try {
      const product = gearProduct(item);
      const resolvedLink = draft.shop_url.trim() || GEAR_SHOP_DEFAULT_LINK;
      const res = await adminFetch(
        `/api/admin/images/${encodeURIComponent(item.image_id)}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            associated_products: [
              {
                product_id: product?.product_id ?? `gear_${item.image_id}`,
                name: draft.name.trim(),
                price: draft.price.trim(),
                shop_url: resolvedLink,
                position_x: product?.position_x ?? "50%",
                position_y: product?.position_y ?? "50%",
              },
            ],
          }),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save product");
      }

      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSavingId(null);
    }
  };

  const replaceImage = async (item: ArchiveImage, file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File exceeds ${MAX_SIZE_MB}MB limit`);
      return;
    }

    setReplacingId(item.image_id);
    setError(null);

    try {
      const presignRes = await adminFetch("/api/admin/upload", {
        method: "POST",
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          imageRole: "gear",
          imageId: item.image_id,
        }),
      });

      if (!presignRes.ok) {
        const data = await presignRes.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to get upload URL");
      }

      const { uploadUrl, publicUrl } = await presignRes.json();
      await uploadFileToR2(uploadUrl, file);

      const res = await adminFetch(
        `/api/admin/images/${encodeURIComponent(item.image_id)}`,
        {
          method: "PATCH",
          body: JSON.stringify({ r2_url: publicUrl }),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to update image URL");
      }

      await loadProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Replace failed");
    } finally {
      setReplacingId(null);
    }
  };

  const deleteProduct = async (item: ArchiveImage) => {
    const name = gearProduct(item)?.name ?? item.image_id;
    if (
      !window.confirm(
        `Delete "${name}"?\n\nThis removes the database record. R2 files under gear/${item.image_id}/ are not deleted automatically.`,
      )
    ) {
      return;
    }

    setDeletingId(item.image_id);
    setError(null);

    try {
      const res = await adminFetch(
        `/api/admin/images/${encodeURIComponent(item.image_id)}`,
        { method: "DELETE" },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Delete failed");
      }

      setItems((prev) => prev.filter((row) => row.image_id !== item.image_id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black uppercase">Gear Products</h1>
          <p className="mt-1 text-sm text-black/60">
            Screen 4: upload and manage product cards. Stored in R2{" "}
            <code className="text-xs">gear/</code>.
          </p>
        </div>
        <Link
          href="/admin"
          className="text-[10px] font-black uppercase text-jojo-purple underline"
        >
          ← All Images
        </Link>
      </div>

      {error && (
        <p className="border-4 border-black bg-red-100 px-4 py-3 text-sm font-medium">
          {error}
        </p>
      )}

      <section className="space-y-4 border-4 border-black bg-jojo-yellow p-5">
        <h2 className="text-sm font-black uppercase tracking-wider">
          New Product
        </h2>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="text-[10px] font-black uppercase">Title *</span>
            <input
              value={productTitle}
              onChange={(e) => setProductTitle(e.target.value)}
              placeholder="Leather Restraint Set"
              className="mt-1 w-full border-4 border-black bg-white px-3 py-2 text-sm outline-none"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-black uppercase">Shop Link</span>
            <input
              type="url"
              value={shopLink}
              onChange={(e) => setShopLink(e.target.value)}
              placeholder={GEAR_SHOP_DEFAULT_LINK}
              className="mt-1 w-full border-4 border-black bg-white px-3 py-2 text-sm outline-none"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-black uppercase">Price</span>
            <input
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              placeholder="49.99"
              className="mt-1 w-full border-4 border-black bg-white px-3 py-2 text-sm outline-none"
            />
          </label>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleNewFiles(e.dataTransfer.files);
          }}
          className={`flex min-h-[200px] flex-col items-center justify-center border-4 border-dashed p-6 transition-colors ${
            dragging
              ? "border-jojo-purple bg-jojo-purple/10"
              : "border-black bg-white"
          }`}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Preview"
              className="mb-3 max-h-40 border-4 border-black object-contain shadow-[4px_4px_0px_#00FFCC]"
            />
          ) : (
            <p className="text-3xl">📁</p>
          )}
          <p className="mt-2 text-xs font-black uppercase">
            {dragging ? "Drop image here" : "Drag & drop product image"}
          </p>
          <label className="mt-3 cursor-pointer border-4 border-black bg-jojo-cyan px-4 py-2 text-[10px] font-black uppercase">
            Browse Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleNewFiles(e.target.files)}
            />
          </label>
        </div>

        {pendingFile && (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-bold text-black/60">
              {pendingFile.name} · {(pendingFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <button
              type="button"
              onClick={() => pendingFile && uploadNewProduct(pendingFile)}
              disabled={uploading || !productTitle.trim()}
              className="border-4 border-black bg-black px-5 py-2 text-xs font-black uppercase text-jojo-cyan disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Upload Product"}
            </button>
          </div>
        )}

        {progress && (
          <p className="border-4 border-black bg-white px-3 py-2 text-xs font-black uppercase">
            {progress}
          </p>
        )}
      </section>

      {loading ? (
        <p className="text-sm font-bold text-black/50">Loading products…</p>
      ) : items.length === 0 ? (
        <p className="text-sm font-bold text-black/50">
          No gear products yet. Upload one above.
        </p>
      ) : (
        <div className="space-y-6">
          <h2 className="text-sm font-black uppercase tracking-wider">
            Manage Products ({items.length})
          </h2>
          {items.map((item) => {
            const draft = drafts[item.image_id] ?? draftFromItem(item);
            const busy =
              savingId === item.image_id ||
              replacingId === item.image_id ||
              deletingId === item.image_id;

            return (
              <section
                key={item.image_id}
                className="border-4 border-black bg-white p-5 shadow-[6px_6px_0px_#D600FF]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs text-black/50">{item.image_id}</p>
                    <p className="mt-1 text-xs text-black/40">
                      Order {item.sort_order} · Screen 4 shows first 3
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => saveProduct(item)}
                      disabled={busy}
                      className="border-2 border-black bg-jojo-cyan px-3 py-1 text-[10px] font-black uppercase disabled:opacity-50"
                    >
                      {savingId === item.image_id ? "Saving…" : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteProduct(item)}
                      disabled={busy}
                      className="border-2 border-black bg-red-100 px-3 py-1 text-[10px] font-black uppercase disabled:opacity-50"
                    >
                      {deletingId === item.image_id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[160px_1fr]">
                  <div>
                    {item.r2_url.startsWith("http") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.r2_url}
                        alt={draft.name || item.image_id}
                        className="aspect-square w-full border-4 border-black object-cover shadow-[4px_4px_0px_#00FFCC]"
                      />
                    ) : (
                      <div className="flex aspect-square items-center justify-center border-4 border-black bg-black/5 text-[10px] font-black uppercase text-black/30">
                        No Image
                      </div>
                    )}
                    <label className="mt-2 flex cursor-pointer flex-col items-center border-4 border-dashed border-black/30 p-2 hover:border-jojo-purple">
                      <span className="text-[9px] font-black uppercase text-jojo-purple">
                        {replacingId === item.image_id ? "Uploading…" : "Replace Image"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        disabled={busy}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) replaceImage(item, file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block sm:col-span-2">
                      <span className="text-[10px] font-black uppercase">Title *</span>
                      <input
                        value={draft.name}
                        onChange={(e) =>
                          updateDraft(item.image_id, { name: e.target.value })
                        }
                        className="mt-1 w-full border-4 border-black bg-white px-3 py-2 text-sm outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[10px] font-black uppercase">Price</span>
                      <input
                        value={draft.price}
                        onChange={(e) =>
                          updateDraft(item.image_id, { price: e.target.value })
                        }
                        placeholder="49.99"
                        className="mt-1 w-full border-4 border-black bg-white px-3 py-2 text-sm outline-none"
                      />
                      {draft.price && (
                        <p className="mt-1 text-[10px] text-black/40">
                          Preview: {formatUsdPrice(draft.price)}
                        </p>
                      )}
                    </label>
                    <label className="block">
                      <span className="text-[10px] font-black uppercase">Shop Link</span>
                      <input
                        type="url"
                        value={draft.shop_url}
                        onChange={(e) =>
                          updateDraft(item.image_id, { shop_url: e.target.value })
                        }
                        placeholder={GEAR_SHOP_DEFAULT_LINK}
                        className="mt-1 w-full border-4 border-black bg-white px-3 py-2 text-sm outline-none"
                      />
                    </label>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
