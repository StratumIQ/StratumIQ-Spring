"use client";

import { motion } from "framer-motion";
import Breadcrumb, { type BreadcrumbItem } from "./Breadcrumb";
import FooterActions from "./FooterActions";
import { cn } from "@/lib/utils";

type Props = {
  title?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: number | "full";
  className?: string;
  noPadding?: boolean;
};

export default function PageShell({
  title,
  description,
  breadcrumbs = [],
  actions,
  footer,
  children,
  maxWidth = 1400,
  className,
  noPadding,
}: Props) {
  return (
    <motion.div
      className={cn("d-page-shell", noPadding && "d-page-shell--flush", className)}
      style={maxWidth !== "full" ? { maxWidth } : undefined}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      {breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} />}

      {(title || actions) && (
        <header className="d-page-header">
          <div className="d-page-header-text">
            {title && <h1 className="d-page-title">{title}</h1>}
            {description && <p className="d-page-desc">{description}</p>}
          </div>
          {actions && <div className="d-page-actions">{actions}</div>}
        </header>
      )}

      <div className="d-page-content">{children}</div>

      <FooterActions>{footer}</FooterActions>
    </motion.div>
  );
}
