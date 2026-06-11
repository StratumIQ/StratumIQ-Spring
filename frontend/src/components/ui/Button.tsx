"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

type Variant = "primary" | "ghost" | "outline" | "navy" | "danger";
type Size    = "sm" | "md" | "lg";

type ButtonProps = {
  children:  React.ReactNode;
  variant?:  Variant;
  size?:     Size;
  className?: string;
  href?:     string;
  onClick?:  () => void;
  disabled?: boolean;
  type?:     "button" | "submit" | "reset";
  fullWidth?: boolean;
  loading?:  boolean;
  tooltip?:  string;
};

const VARIANTS: Record<Variant, string> = {
  primary: "bg-[#E8692C] hover:bg-[#D45A1F] text-white shadow-[0_0_18px_rgba(232,105,44,0.3)] hover:shadow-[0_0_24px_rgba(232,105,44,0.45)]",
  ghost:   "bg-white/10 hover:bg-white/18 text-white border border-white/25 hover:border-white/40",
  outline: "bg-transparent hover:bg-[rgba(232,105,44,0.06)] text-white border border-white/20 hover:border-[#E8692C] hover:text-[#E8692C]",
  navy:    "bg-[#1C2333] hover:bg-[#242E42] text-white",
  danger:  "bg-[#DC2626] hover:bg-[#B91C1C] text-white",
};

const SIZES: Record<Size, string> = {
  sm: "h-8  px-3.5 text-[12px] rounded-[7px]",
  md: "h-10 px-5   text-[13px] rounded-[9px]",
  lg: "h-12 px-7   text-[14px] rounded-[10px]",
};

export default function Button({
  children, variant = "primary", size = "md",
  className, href, onClick, disabled = false,
  type = "button", fullWidth = false, loading = false, tooltip,
}: ButtonProps) {
  const base = cn(
    "inline-flex items-center justify-center font-semibold tracking-tight",
    "transition-all duration-150 cursor-pointer select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8692C] focus-visible:ring-offset-2",
    VARIANTS[variant],
    SIZES[size],
    fullWidth && "w-full",
    (disabled || loading) && "opacity-50 cursor-not-allowed pointer-events-none",
    className
  );

  const content = loading ? (
    <span className="flex items-center gap-2">
      <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
      {children}
    </span>
  ) : children;

  const el = href && !disabled ? (
    <Link href={href} className={base} title={tooltip}>{content}</Link>
  ) : (
    <button
      type={type} onClick={onClick}
      disabled={disabled || loading}
      className={base} title={tooltip}
    >
      {content}
    </button>
  );

  return el;
}