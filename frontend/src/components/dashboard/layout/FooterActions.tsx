"use client";

import { cn } from "@/lib/utils";

type Props = {
  children?: React.ReactNode;
  className?: string;
};

export default function FooterActions({ children, className }: Props) {
  if (!children) return null;

  return (
    <div className={cn("d-footer-actions", className)} role="toolbar" aria-label="Page actions">
      {children}
    </div>
  );
}
