import { ImageUploader } from "@/components/admin/ImageUploader";

export default function AdminUploadPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <ImageUploader
        imageRole="archive"
        title="Archive Upload"
        description="Screens 1–2 random pool (Hero background + Visual Hub). Stored in archive/."
        redirectToTagger={false}
        showLockedToggle
      />
    </div>
  );
}
