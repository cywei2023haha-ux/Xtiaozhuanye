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
 * In-flow sized box + covering img.
 * Avoid next/image `fill` (fragile on iOS) and avoid making the ONLY
 * child `absolute` without a sized parent.
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
      <div className={`relative h-full w-full min-h-0 min-w-0 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          decoding="async"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          referrerPolicy="no-referrer"
          className={`block h-full w-full object-cover object-center ${imageClassName}`}
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
