import { CharacterPreviewScroller } from "@/components/gallery/CharacterPreviewScroller";
import { fetchCharacterSetById } from "@/lib/character-sets";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ setId: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { setId } = await params;
  try {
    const item = await fetchCharacterSetById(setId);
    return {
      title: item ? `${item.display_name} — ASTRABLOOM:GALLERY` : "Character Preview",
    };
  } catch {
    return { title: "Character Preview" };
  }
}

export default async function CharacterPreviewPage({ params }: PageProps) {
  const { setId } = await params;

  try {
    const characterSet = await fetchCharacterSetById(setId);
    if (!characterSet) notFound();
    return <CharacterPreviewScroller characterSet={characterSet} />;
  } catch {
    notFound();
  }
}
