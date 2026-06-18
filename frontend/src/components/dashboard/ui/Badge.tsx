"use client";

import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "orange";
  size?: "sm" | "md";
  className?: string;
};

export default function Badge({
  children,
  variant = "default",
  size = "sm",
  className,
}: Props) {
  return (
    <span className={cn("d-badge", `d-badge--${variant}`, `d-badge--${size}`, className)}>
      {children}
    </span>
  );
}
