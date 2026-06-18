"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type SelectOption = { value: string; label: string };

type FilterSelect = {
  key: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  width?: number;
};

type Props = {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  selects?: FilterSelect[];
  trailing?: React.ReactNode;
  className?: string;
};

export default function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  selects = [],
  trailing,
  className,
}: Props) {
  return (
    <div className={cn("d-filter-bar", className)}>
      {onSearchChange !== undefined && (
        <div className="d-filter-search">
          <Search size={14} className="d-filter-search-icon" />
          <input
            className="dash-input d-filter-input"
            placeholder={searchPlaceholder}
            value={search ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search"
          />
        </div>
      )}

      {selects.map((sel) => (
        <div key={sel.key} className="d-filter-select-wrap" style={{ width: sel.width }}>
          <select
            className="dash-input d-filter-select"
            value={sel.value}
            onChange={(e) => sel.onChange(e.target.value)}
            aria-label={sel.key}
          >
            {sel.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      ))}

      {trailing && <div className="d-filter-trailing">{trailing}</div>}
    </div>
  );
}
