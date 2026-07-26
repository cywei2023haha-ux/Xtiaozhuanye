"use client";

import { type ReactNode, useEffect } from "react";
import { JojoCard } from "@/components/ui/JojoCard";

type ComicDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  ctaLabel: string;
  ctaHref: string;
  children?: ReactNode;
};

export function ComicDialog({
  open,
  onClose,
  title,
  message,
  ctaLabel,
  ctaHref,
}: ComicDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="comic-dialog-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div className="comic-dialog-bubble relative z-10 w-full max-w-md animate-comic-pop">
        <div className="comic-dialog-tail" aria-hidden />
        <JojoCard hover="none" className="bg-jojo-yellow p-6 sm:p-8">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-jojo-purple">
            Stand User Says —
          </p>
          <h2
            id="comic-dialog-title"
            className="mb-3 text-2xl font-black uppercase leading-tight sm:text-3xl"
          >
            {title}
          </h2>
          <p className="mb-6 text-sm font-medium leading-relaxed sm:text-base">
            {message}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <JojoCard
              as="a"
              href={ctaHref}
              hover="invert"
              className="flex-1 bg-jojo-purple px-4 py-3 text-center text-sm font-black uppercase text-white"
            >
              {ctaLabel}
            </JojoCard>
            <JojoCard
              as="button"
              hover="lift"
              onClick={onClose}
              className="flex-1 bg-white px-4 py-3 text-center text-sm font-black uppercase"
            >
              Not Yet
            </JojoCard>
          </div>
        </JojoCard>
      </div>
    </div>
  );
}
