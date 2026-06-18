"use client";

import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: "sm" | "md" | "lg" | "full";
};

export default function Skeleton({ className, width, height, rounded = "md" }: Props) {
  return (
    <div
      className={cn("d-skeleton", `d-skeleton--${rounded}`, className)}
      style={{ width, height }}
      aria-hidden
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="d-glass-card d-glass-p-md">
      <Skeleton height={140} rounded="md" className="d-skeleton-block" />
      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
        <Skeleton height={18} width="65%" />
        <Skeleton height={13} width="45%" />
        <Skeleton height={13} width="80%" />
      </div>
    </div>
  );
}
