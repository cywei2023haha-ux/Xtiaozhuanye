"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type GalleryContextValue = {
  galleryOpen: boolean;
  openGallery: () => void;
};

const GalleryContext = createContext<GalleryContextValue>({
  galleryOpen: false,
  openGallery: () => {},
});

export function GalleryProvider({ children }: { children: ReactNode }) {
  const [galleryOpen, setGalleryOpen] = useState(false);

  const openGallery = useCallback(() => {
    setGalleryOpen(true);
    window.setTimeout(() => {
      document.getElementById("archive-gallery")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }, []);

  return (
    <GalleryContext.Provider value={{ galleryOpen, openGallery }}>
      {children}
    </GalleryContext.Provider>
  );
}

export function useGallery() {
  return useContext(GalleryContext);
}
