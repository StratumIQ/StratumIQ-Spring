"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type Props = {
  items: BreadcrumbItem[];
  className?: string;
};

export default function Breadcrumb({ items, className }: Props) {
  return (
    <nav aria-label="Breadcrumb" className={cn("d-breadcrumb", className)}>
      <ol className="d-breadcrumb-list">
        <li>
          <Link href="/dashboard" className="d-breadcrumb-link" aria-label="Dashboard home">
            <Home size={13} strokeWidth={2} />
          </Link>
        </li>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="d-breadcrumb-item">
              <ChevronRight size={12} className="d-breadcrumb-sep" aria-hidden />
              {isLast || !item.href ? (
                <span className="d-breadcrumb-current" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="d-breadcrumb-link">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
