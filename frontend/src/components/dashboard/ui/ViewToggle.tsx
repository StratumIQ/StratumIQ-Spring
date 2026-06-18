"use client";

import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "grid" | "table";

type Props = {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
};

export default function ViewToggle({ value, onChange }: Props) {
  return (
    <div className="d-view-toggle" role="group" aria-label="View mode">
      <button
        type="button"
        className={cn("d-view-toggle-btn", value === "grid" && "active")}
        onClick={() => onChange("grid")}
        aria-pressed={value === "grid"}
        aria-label="Card view"
      >
        <LayoutGrid size={15} />
      </button>
      <button
        type="button"
        className={cn("d-view-toggle-btn", value === "table" && "active")}
        onClick={() => onChange("table")}
        aria-pressed={value === "table"}
        aria-label="Table view"
      >
        <List size={15} />
      </button>
    </div>
  );
}
