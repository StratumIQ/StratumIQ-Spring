"use client";

import { cn } from "@/lib/utils";

export type TabItem<T extends string = string> = {
  id: T;
  label: string;
  icon?: React.ReactNode;
};

type Props<T extends string> = {
  tabs: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  variant?: "pill" | "line";
  className?: string;
};

export default function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  variant = "pill",
  className,
}: Props<T>) {
  if (variant === "line") {
    return (
      <div className={cn("d-tabs-line", className)} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={value === tab.id}
            className={cn("d-tab-line", value === tab.id && "active")}
            onClick={() => onChange(tab.id)}
          >
            {tab.icon && <span style={{ marginRight: 6, display: "inline-flex" }}>{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("d-tabs", className)} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={value === tab.id}
          className={cn("d-tab", value === tab.id && "active")}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon && <span style={{ marginRight: 6, display: "inline-flex" }}>{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
