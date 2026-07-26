import { ImageUploader } from "@/components/admin/ImageUploader";

export default function AdminGalleryUploadPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <ImageUploader
        imageRole="gallery"
        title="Tagged Gallery Upload"
        description="Screen 5 infinite scroll with shopping-cart tags. Stored in gallery/."
        redirectToTagger
        showLockedToggle
      />
    </div>
  );
}
