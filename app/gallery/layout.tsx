import { Suspense } from "react";
import { RefTrackerProvider } from "@/hooks/useRefTracker";

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <RefTrackerProvider>{children}</RefTrackerProvider>
    </Suspense>
  );
}
