import { HomePage } from "@/components/HomePage";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-white">
          <p className="text-sm font-black uppercase tracking-widest">Loading…</p>
        </main>
      }
    >
      <HomePage />
    </Suspense>
  );
}
