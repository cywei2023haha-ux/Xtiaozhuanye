import { CharacterGalleryPage } from "@/components/gallery/CharacterGalleryPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ASTRABLOOM:GALLERY",
  description: "Character visual collections — infinite profile stream",
};

export default function GalleryPage() {
  return <CharacterGalleryPage />;
}
