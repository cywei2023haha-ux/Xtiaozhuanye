"use client";

import { adminFetch } from "@/lib/admin-client";
import { r2PrefixForRole } from "@/lib/image-roles";
import { uploadFileToR2 } from "@/lib/upload-client";
import type { ImageRole } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

const MAX_SIZE_MB = 10;

type ImageUploaderProps = {
  imageRole: ImageRole;
  title: string;
  description: string;
  /** After upload, open tag editor (gallery / archive) or return to admin home (gear) */
  redirectToTagger?: boolean;
  showLockedToggle?: boolean;
};

export function ImageUploader({
  imageRole,
  title,
  description,
  redirectToTagger = true,
  showLockedToggle = imageRole === "archive",
}: ImageUploaderProps) {
  const router = useRouter();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const storageFolder = r2PrefixForRole(imageRole);

  const uploadFile = useCallback(
    async (file: File) => {
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
            imageRole,
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

        const { uploadUrl, publicUrl, imageId } = await presignRes.json();

        setProgress(`Uploading to R2 (${storageFolder}/)…`);
        await uploadFileToR2(uploadUrl, file);

        setProgress("Saving to Supabase…");
        const saveRes = await adminFetch("/api/admin/images", {
          method: "POST",
          body: JSON.stringify({
            image_id: imageId,
            r2_url: publicUrl,
            image_role: imageRole,
            is_locked: showLockedToggle ? isLocked : false,
          }),
        });

        if (!saveRes.ok) {
          const data = await saveRes.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to save image record");
        }

        setProgress("Done!");
        if (redirectToTagger) {
          router.push(`/admin/tag/${encodeURIComponent(imageId)}`);
        } else {
          router.push("/admin");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
        setProgress(null);
      } finally {
        setUploading(false);
      }
    },
    [imageRole, isLocked, redirectToTagger, router, showLockedToggle, storageFolder],
  );

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    setPendingFile(file);
    setPreview(URL.createObjectURL(file));
    setError(null);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black uppercase">{title}</h1>
        <p className="mt-1 text-sm text-black/60">{description}</p>
        <p className="mt-2 inline-block border-2 border-black bg-jojo-yellow px-2 py-0.5 text-[10px] font-black uppercase">
          R2 folder: {storageFolder}/
        </p>
      </div>

      {showLockedToggle && (
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={isLocked}
            onChange={(e) => setIsLocked(e.target.checked)}
            className="h-4 w-4 border-2 border-black"
          />
          <span className="text-sm font-bold uppercase">Mark as locked (blur on site)</span>
        </label>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex min-h-[280px] flex-col items-center justify-center border-4 border-dashed p-8 transition-colors ${
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
            className="mb-4 max-h-48 border-4 border-black object-contain shadow-[4px_4px_0px_#00FFCC]"
          />
        ) : (
          <p className="text-4xl">📁</p>
        )}
        <p className="mt-3 text-sm font-black uppercase">
          {dragging ? "Drop to upload" : "Drag & drop image here"}
        </p>
        <p className="mt-1 text-xs text-black/50">JPEG, PNG, WebP · max {MAX_SIZE_MB}MB</p>
        <label className="mt-4 cursor-pointer border-4 border-black bg-jojo-yellow px-5 py-2 text-xs font-black uppercase hover:shadow-[4px_4px_0px_#00FFCC]">
          Browse Files
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>

      {pendingFile && (
        <div className="flex flex-wrap items-center gap-4 border-4 border-black bg-white p-4">
          <div className="flex-1">
            <p className="text-sm font-black uppercase">{pendingFile.name}</p>
            <p className="text-xs text-black/50">
              {(pendingFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <button
            type="button"
            onClick={() => pendingFile && uploadFile(pendingFile)}
            disabled={uploading}
            className="border-4 border-black bg-black px-6 py-3 text-xs font-black uppercase text-jojo-cyan disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Upload to R2 →"}
          </button>
        </div>
      )}

      {progress && (
        <p className="border-4 border-black bg-jojo-cyan px-4 py-2 text-xs font-black uppercase">
          {progress}
        </p>
      )}
      {error && (
        <p className="border-4 border-black bg-red-100 px-4 py-2 text-xs font-bold">{error}</p>
      )}
    </div>
  );
}
