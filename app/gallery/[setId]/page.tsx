import { CharacterPreviewScroller } from "@/components/gallery/CharacterPreviewScroller";
import { fetchCharacterSetById } from "@/lib/character-sets";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type PageProps = { params: Promise<{ setId: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { setId } = await params;
  const item = await fetchCharacterSetById(setId);
  return {
    title: item ? `${item.display_name} — ASTRABLOOM:GALLERY` : "Character Preview",
  };
}

export default async function CharacterPreviewPage({ params }: PageProps) {
  const { setId } = await params;
  const characterSet = await fetchCharacterSetById(setId);

  if (!characterSet) {
    notFound();
  }

  return <CharacterPreviewScroller characterSet={characterSet} />;
}
