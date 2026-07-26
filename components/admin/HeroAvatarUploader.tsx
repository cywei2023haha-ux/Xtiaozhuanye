"use client";

import { adminFetch } from "@/lib/admin-client";
import { uploadFileToR2 } from "@/lib/upload-client";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

const MAX_SIZE_MB = 5;

export function HeroAvatarUploader() {
  const router = useRouter();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

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
            imageRole: "hero_avatar",
          }),
        });

        if (!presignRes.ok) {
          const data = await presignRes.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to get upload URL");
        }

        const { uploadUrl, publicUrl, imageId } = await presignRes.json();

        setProgress("Uploading to R2 (avatars/)…");
        await uploadFileToR2(uploadUrl, file);

        setProgress("Saving hero avatar…");
        const saveRes = await adminFetch("/api/admin/images", {
          method: "POST",
          body: JSON.stringify({
            image_id: imageId,
            r2_url: publicUrl,
            image_role: "hero_avatar",
          }),
        });

        if (!saveRes.ok) {
          const data = await saveRes.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to save hero avatar");
        }

        setProgress("Hero avatar updated!");
        router.push("/admin");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
        setProgress(null);
      } finally {
        setUploading(false);
      }
    },
    [router],
  );

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setPendingFile(file);
    setPreview(URL.createObjectURL(file));
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black uppercase">Hero Avatar</h1>
        <p className="mt-1 text-sm text-black/60">
          Upload a dedicated profile photo. It will <strong>not</strong> appear
          in random gallery picks on Hero or Visual Hub.
        </p>
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
          handleFiles(e.dataTransfer.files);
        }}
        className={`flex min-h-[240px] flex-col items-center justify-center border-4 border-dashed p-8 ${
          dragging ? "border-jojo-purple bg-jojo-purple/10" : "border-black bg-white"
        }`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Avatar preview"
            className="mb-4 h-32 w-32 border-4 border-black object-cover shadow-[4px_4px_0px_#00FFCC]"
          />
        ) : (
          <p className="text-4xl">👤</p>
        )}
        <label className="mt-4 cursor-pointer border-4 border-black bg-jojo-yellow px-5 py-2 text-xs font-black uppercase">
          Browse Avatar
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>

      {pendingFile && (
        <button
          type="button"
          onClick={() => uploadFile(pendingFile)}
          disabled={uploading}
          className="w-full border-4 border-black bg-black py-3 text-xs font-black uppercase text-jojo-cyan disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Set as Hero Avatar →"}
        </button>
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
