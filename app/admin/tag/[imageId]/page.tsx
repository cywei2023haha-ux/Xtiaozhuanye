import { ImageTagger } from "@/components/admin/ImageTagger";

type PageProps = {
  params: Promise<{ imageId: string }>;
};

export default async function AdminTagPage({ params }: PageProps) {
  const { imageId } = await params;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <ImageTagger imageId={decodeURIComponent(imageId)} />
    </div>
  );
}
