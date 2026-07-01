"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline" | "success";
type Size = "sm" | "md" | "lg";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
};

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", loading, icon, children, className, disabled, type = "button", ...rest },
  ref,
) {
  const isIconOnly = !children && Boolean(icon);

  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "d-btn",
        `d-btn--${variant}`,
        `d-btn--${size}`,
        loading && "d-btn--loading",
        isIconOnly && "d-btn--icon",
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Loader2 size={size === "sm" ? 14 : 16} className="d-btn-spinner-icon" /> : icon}
      {children && <span>{children}</span>}
    </button>
  );
});

export default Button;
