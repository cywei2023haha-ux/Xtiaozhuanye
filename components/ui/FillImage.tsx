"use client";

import { getMockGradient } from "@/lib/mock-images";
import { useState } from "react";

type FillImageProps = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

/**
 * Cover-crop into parent box (any source aspect → frame).
 * Uses absolute inset img so height works inside aspect-ratio frames
 * on mobile Safari (percentage h-full alone often collapses).
 * Landscape e.g. 1664×1080 in 9:16 → scale to cover, crop left/right.
 */
export function FillImage({
  src,
  alt,
  className = "",
  imageClassName = "",
  priority = false,
}: FillImageProps) {
  const [failed, setFailed] = useState(false);
  const gradient = getMockGradient(src);
  const isRemote = src.startsWith("http");

  if (isRemote && !failed) {
    return (
      <div
        className={`relative h-full w-full min-h-0 min-w-0 overflow-hidden ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          decoding="async"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          referrerPolicy="no-referrer"
          className={`absolute inset-0 h-full w-full max-w-none object-cover object-center ${imageClassName}`}
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  if (gradient) {
    return (
      <div
        className={`h-full w-full bg-gradient-to-br ${gradient} ${className} ${imageClassName}`}
        role="img"
        aria-label={alt}
      />
    );
  }

  return (
    <div
      className={`h-full w-full bg-gradient-to-br from-jojo-yellow to-jojo-purple ${className}`}
      role="img"
      aria-label={alt}
    />
  );
}
