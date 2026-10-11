"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

type Variant = "primary" | "ghost" | "outline" | "navy" | "danger" | "secondary";
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

export default function Button({
  children, variant = "primary", size = "md",
  className, href, onClick, disabled = false,
  type = "button", fullWidth = false, loading = false, tooltip,
}: ButtonProps) {
  const classes = cn(
    "ui-btn",
    `ui-btn--${variant}`,
    `ui-btn--${size}`,
    fullWidth && "ui-btn--full",
    (disabled || loading) && "is-loading",
    className,
  );

  const content = loading ? (
    <span className="flex items-center gap-2">
      <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
      {children}
    </span>
  ) : children;

  if (href && !disabled) {
    return <Link href={href} className={classes} title={tooltip}>{content}</Link>;
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
      title={tooltip}
    >
      {content}
    </button>
  );
}
