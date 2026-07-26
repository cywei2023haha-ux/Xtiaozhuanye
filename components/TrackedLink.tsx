"use client";

import { useRefTracker } from "@/hooks/useRefTracker";
import { type ComponentProps } from "react";

type TrackedLinkProps = Omit<ComponentProps<"a">, "href"> & {
  href: string;
  medium?: string;
};

export function TrackedLink({
  href,
  medium = "bridge",
  target = "_blank",
  rel = "noopener noreferrer",
  ...props
}: TrackedLinkProps) {
  const { appendRef } = useRefTracker();
  return (
    <a href={appendRef(href, medium)} target={target} rel={rel} {...props} />
  );
}
