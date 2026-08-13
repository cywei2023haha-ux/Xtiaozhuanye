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
 * Cover-crop into a sized parent (any source aspect → frame).
 * Parent must have real size (width + in-flow pad/height). Pass
 * `className="absolute inset-0"` when overlaying a pad-lock box.
 * Landscape e.g. 1664×1080 → crops left/right via object-cover.
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
        className={
          className.trim()
            ? `overflow-hidden ${className}`
            : "relative h-full w-full min-h-0 min-w-0 overflow-hidden"
        }
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
