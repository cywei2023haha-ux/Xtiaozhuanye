"use client";

import { useRefTracker } from "@/hooks/useRefTracker";
import { JojoCard } from "@/components/ui/JojoCard";
import { type ReactNode } from "react";

type TrackedJojoCardProps = {
  href: string;
  medium?: string;
  children: ReactNode;
  className?: string;
  hover?: "lift" | "invert" | "none";
};

export function TrackedJojoCard({
  href,
  medium = "bridge",
  children,
  className = "",
  hover = "lift",
}: TrackedJojoCardProps) {
  const { appendRef } = useRefTracker();

  return (
    <JojoCard as="a" href={appendRef(href, medium)} hover={hover} className={className}>
      {children}
    </JojoCard>
  );
}
