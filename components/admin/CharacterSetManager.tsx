"use client";

import { adminFetch } from "@/lib/admin-client";
import {
  buildEmptyPreviewSlots,
  type CharacterSet,
} from "@/lib/character-sets";
import {
  CHARACTER_SLOT_COUNT,
  characterSlotFilename,
} from "@/lib/character-storage";
import { LINKS } from "@/lib/config";
import { uploadFileToR2 } from "@/lib/upload-client";
import { useCallback, useEffect, useState } from "react";

const MAX_SIZE_MB = 10;

export function CharacterSetManager() {
  const [sets, setSets] = useState<CharacterSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [folderSlug, setFolderSlug] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [unlockUrl, setUnlockUrl] = useState(LINKS.fanClub);
  const [creating, setCreating] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadSets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/character-sets");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to load character sets");
      }
      const data = await res.json();
      setSets(data.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSets();
  }, [loadSets]);

  const createSet = async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/character-sets", {
        method: "POST",
        body: JSON.stringify({
          folder_slug: folderSlug,
          display_name: displayName,
          unlock_url: unlockUrl,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to create set");
      }
      setFolderSlug("");
      setDisplayName("");
      await loadSets();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreating(false);
    }
  };

  const uploadSlot = async (
    set: CharacterSet,
    slot: number,
    file: File,
  ) => {
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File exceeds ${MAX_SIZE_MB}MB limit`);
      return;
    }

    const uploadKey = `${set.set_id}-${slot}`;
    setUploadingKey(uploadKey);
    setError(null);

    try {
      const presignRes = await adminFetch("/api/admin/upload", {
        method: "POST",
        body: JSON.stringify({
          filename: characterSlotFilename(slot),
          contentType: file.type,
          characterFolder: set.folder_slug,
          characterSlot: slot,
        }),
      });

      if (!presignRes.ok) {
        const data = await presignRes.json().catch(() => ({}));
        const detail =
          typeof data.error === "string"
            ? data.error
            : `HTTP ${presignRes.status}`;
        throw new Error(`Failed to get upload URL: ${detail}`);
      }

      const { uploadUrl, publicUrl } = await presignRes.json();
      if (!uploadUrl || !publicUrl) {
        throw new Error("Upload API returned empty uploadUrl/publicUrl");
      }
      await uploadFileToR2(uploadUrl, file);

      const slots = buildEmptyPreviewSlots();
      set.preview_images.forEach((url, i) => {
        slots[i] = url;
      });
      slots[slot - 1] = publicUrl;

      const saveRes = await adminFetch("/api/admin/character-sets", {
        method: "PATCH",
        body: JSON.stringify({
          set_id: set.set_id,
          preview_images: slots,
        }),
      });

      if (!saveRes.ok) {
        const data = await saveRes.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save preview URLs");
      }

      await loadSets();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingKey(null);
    }
  };

  const deleteSet = async (set: CharacterSet) => {
    if (
      !window.confirm(
        `Delete "${set.display_name}"?\n\nThis removes the database record. R2 files under My_AI_Output/${set.folder_slug}/ are not deleted automatically.`,
      )
    ) {
      return;
    }

    setDeletingId(set.set_id);
    setError(null);

    try {
      const res = await adminFetch(
        `/api/admin/character-sets/${encodeURIComponent(set.set_id)}`,
        { method: "DELETE" },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Delete failed");
      }

      setSets((prev) => prev.filter((item) => item.set_id !== set.set_id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black uppercase">Character Sets</h1>
        <p className="mt-1 text-sm text-black/60">
          R2 path: <code className="text-xs">My_AI_Output/{"{role}"}/01.webp … 05.webp</code>
        </p>
      </div>

      {error && (
        <p className="border-4 border-black bg-red-100 px-4 py-3 text-sm font-medium">
          {error}
        </p>
      )}

      <section className="space-y-4 border-4 border-black bg-jojo-yellow p-5">
        <h2 className="text-sm font-black uppercase tracking-wider">New Character Set</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="text-[10px] font-black uppercase">Folder Slug</span>
            <input
              value={folderSlug}
              onChange={(e) => setFolderSlug(e.target.value)}
              placeholder="anis_swimsuit_01"
              className="mt-1 w-full border-4 border-black bg-white px-3 py-2 text-sm outline-none"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-black uppercase">Display Name</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Anis Swimsuit"
              className="mt-1 w-full border-4 border-black bg-white px-3 py-2 text-sm outline-none"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-black uppercase">Patreon Unlock URL</span>
            <input
              value={unlockUrl}
              onChange={(e) => setUnlockUrl(e.target.value)}
              placeholder={LINKS.fanClub}
              className="mt-1 w-full border-4 border-black bg-white px-3 py-2 text-sm outline-none"
            />
          </label>
        </div>
        <button
          type="button"
          disabled={creating}
          onClick={createSet}
          className="border-4 border-black bg-black px-5 py-2 text-xs font-black uppercase text-jojo-cyan disabled:opacity-50"
        >
          {creating ? "Creating…" : "Create Set"}
        </button>
      </section>

      {loading ? (
        <p className="text-sm font-bold text-black/50">Loading sets…</p>
      ) : sets.length === 0 ? (
        <p className="text-sm font-bold text-black/50">
          No sets yet. Create one above, then upload 5 images per folder.
        </p>
      ) : (
        <div className="space-y-6">
          {sets.map((set) => (
            <section
              key={set.set_id}
              className="border-4 border-black bg-white p-5 shadow-[6px_6px_0px_#00FFCC]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-black uppercase">{set.display_name}</p>
                  <p className="mt-1 font-mono text-xs text-black/50">
                    My_AI_Output/{set.folder_slug}/
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`/gallery/${set.set_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-black uppercase text-jojo-purple underline"
                  >
                    Preview →
                  </a>
                  <button
                    type="button"
                    onClick={() => deleteSet(set)}
                    disabled={deletingId === set.set_id}
                    className="border-2 border-black bg-red-100 px-3 py-1 text-[10px] font-black uppercase disabled:opacity-50"
                  >
                    {deletingId === set.set_id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                {Array.from({ length: CHARACTER_SLOT_COUNT }, (_, i) => {
                  const slot = i + 1;
                  const url = set.preview_images[i];
                  const key = `${set.set_id}-${slot}`;
                  const busy = uploadingKey === key;

                  return (
                    <label
                      key={slot}
                      className="flex cursor-pointer flex-col border-4 border-dashed border-black/30 p-2 hover:border-jojo-purple"
                    >
                      <span className="text-[10px] font-black uppercase text-black/50">
                        {characterSlotFilename(slot)}
                      </span>
                      {url?.startsWith("http") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={url}
                          alt={`${set.display_name} ${slot}`}
                          className="mt-2 aspect-[9/16] w-full border-2 border-black object-cover"
                        />
                      ) : (
                        <div className="mt-2 flex aspect-[9/16] items-center justify-center border-2 border-black bg-black/5 text-[10px] font-black uppercase text-black/30">
                          Empty
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        disabled={busy}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadSlot(set, slot, file);
                          e.target.value = "";
                        }}
                      />
                      <span className="mt-2 text-center text-[9px] font-black uppercase text-jojo-purple">
                        {busy ? "Uploading…" : "Upload"}
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
