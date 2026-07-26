"use client";

import { getMockGradient } from "@/lib/mock-images";
import Image from "next/image";
import { useState } from "react";

type FillImageProps = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

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
      <div className={`relative h-full w-full ${className}`}>
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          className={`object-cover object-center ${imageClassName}`}
          sizes="100vw"
          unoptimized
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
