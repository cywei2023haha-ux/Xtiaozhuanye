"use client";

import { adminFetch } from "@/lib/admin-client";
import Link from "next/link";
import { useEffect, useState } from "react";

type AdminImageRow = {
  image_id: string;
  r2_url: string;
  is_locked: boolean;
  sort_order: number;
  image_role?: string;
  associated_products: unknown[];
  created_at?: string;
};

const ROLE_SECTIONS = [
  {
    role: "archive",
    title: "Archive — Screens 1–2",
    folder: "archive/",
    uploadHref: "/admin/upload",
  },
  {
    role: "gear",
    title: "Gear — Screen 4",
    folder: "gear/",
    uploadHref: "/admin/upload/gear",
  },
  {
    role: "gallery",
    title: "Tagged Gallery — Screen 5",
    folder: "gallery/",
    uploadHref: "/admin/upload/gallery",
  },
] as const;

export function AdminImageList() {
  const [items, setItems] = useState<AdminImageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadItems = () => {
    setLoading(true);
    setError(null);
    adminFetch("/api/admin/images")
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to load");
        }
        return res.json();
      })
      .then((data) => setItems(data.items ?? []))
      .catch((err) => setError(err instanceof Error ? err.message : "Error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadItems();
  }, []);

  const deleteImage = async (imageId: string) => {
    if (!window.confirm(`Delete "${imageId}"? This removes the database record.`)) {
      return;
    }

    setDeletingId(imageId);
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

      setItems((prev) => prev.filter((item) => item.image_id !== imageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <p className="text-sm font-black uppercase tracking-widest text-black/40">
        Loading images…
      </p>
    );
  }

  if (error) {
    return (
      <p className="border-4 border-black bg-red-100 p-4 text-sm font-bold">{error}</p>
    );
  }

  const heroCount = items.filter((i) => i.image_role === "hero_avatar").length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/upload"
          className="border-4 border-black bg-jojo-yellow px-4 py-2 text-xs font-black uppercase"
        >
          + Archive
        </Link>
        <Link
          href="/admin/upload/gear"
          className="border-4 border-black bg-jojo-cyan px-4 py-2 text-xs font-black uppercase"
        >
          Gear Hub
        </Link>
        <Link
          href="/admin/upload/gallery"
          className="border-4 border-black bg-white px-4 py-2 text-xs font-black uppercase"
        >
          + Gallery
        </Link>
        <Link
          href="/admin/characters"
          className="border-4 border-black bg-black px-4 py-2 text-xs font-black uppercase text-jojo-cyan"
        >
          + Characters
        </Link>
        <Link
          href="/admin/hero"
          className="border-4 border-black bg-jojo-purple px-4 py-2 text-xs font-black uppercase text-white"
        >
          Hero Avatar ({heroCount})
        </Link>
      </div>

      {ROLE_SECTIONS.map((section) => {
        const sectionItems = items.filter((i) => i.image_role === section.role);

        return (
          <section key={section.role} className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-lg font-black uppercase">
                  {section.title} ({sectionItems.length})
                </h2>
                <p className="text-xs font-bold text-black/50">R2: {section.folder}</p>
              </div>
              <Link
                href={section.role === "gear" ? "/admin/upload/gear" : section.uploadHref}
                className="text-[10px] font-black uppercase underline"
              >
                {section.role === "gear" ? "Manage →" : "Upload →"}
              </Link>
            </div>

            {sectionItems.length === 0 ? (
              <p className="text-sm text-black/50">No images in this pool yet.</p>
            ) : (
              <ul className="divide-y-4 divide-black/10 border-4 border-black bg-white">
                {sectionItems.map((item) => (
                  <li
                    key={item.image_id}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-black uppercase">{item.image_id}</p>
                      <p className="text-xs text-black/50">
                        Order {item.sort_order} · {item.associated_products?.length ?? 0} tags
                        {item.is_locked ? " · 🔒 locked" : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {section.role === "gallery" && (
                        <Link
                          href={`/admin/tag/${encodeURIComponent(item.image_id)}`}
                          className="border-2 border-black px-3 py-1.5 text-[10px] font-black uppercase hover:bg-jojo-cyan"
                        >
                          Edit Tags →
                        </Link>
                      )}
                      {section.role === "gear" && (
                        <Link
                          href="/admin/upload/gear"
                          className="border-2 border-black px-3 py-1.5 text-[10px] font-black uppercase hover:bg-jojo-cyan"
                        >
                          Manage →
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteImage(item.image_id)}
                        disabled={deletingId === item.image_id}
                        className="border-2 border-black bg-red-100 px-3 py-1.5 text-[10px] font-black uppercase disabled:opacity-50"
                      >
                        {deletingId === item.image_id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}
