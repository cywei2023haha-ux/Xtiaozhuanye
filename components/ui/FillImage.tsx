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
 * Prefer native <img> for remote R2 URLs.
 * next/image `fill` + percentage height is unreliable inside aspect-ratio
 * frames on iOS Safari (desktop OK, mobile blank).
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
      <div className={`absolute inset-0 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          decoding="async"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          className={`h-full w-full object-cover object-center ${imageClassName}`}
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  if (gradient) {
    return (
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} ${className} ${imageClassName}`}
        role="img"
        aria-label={alt}
      />
    );
  }

  return (
    <div
      className={`absolute inset-0 bg-gradient-to-br from-jojo-yellow to-jojo-purple ${className}`}
      role="img"
      aria-label={alt}
    />
  );
}
