"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  as?: "div" | "article" | "section";
  onClick?: () => void;
};

const PADDING: Record<string, string> = {
  none: "d-glass-p-none",
  sm:   "d-glass-p-sm",
  md:   "d-glass-p-md",
  lg:   "d-glass-p-lg",
};

export default function GlassCard({
  children,
  className,
  hover = false,
  padding = "md",
  onClick,
}: Props) {
  // Always render as div — never button — to avoid nested <button> hydration errors.
  // Clickable cards use role="button" + keyboard handler for accessibility.
  return (
    <motion.div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn("d-glass-card", PADDING[padding], hover && "d-glass-card--hover", className)}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); } : undefined}
      whileHover={hover ? { y: -2, transition: { duration: 0.18 } } : undefined}
      style={{ cursor: onClick ? "pointer" : undefined }}
    >
      {children}
    </motion.div>
  );
}