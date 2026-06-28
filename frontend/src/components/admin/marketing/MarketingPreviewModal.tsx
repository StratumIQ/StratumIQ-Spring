"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { X, Pin, ChevronLeft, ChevronRight } from "lucide-react";
import { resolveAssetUrl, MARKETING } from "@/lib/constants";
import type { MarketingItem } from "@/lib/api/marketing";

type Props = {
  item: MarketingItem;
  items?: MarketingItem[];
  onClose: () => void;
};

export default function MarketingPreviewModal({ item, items = [], onClose }: Props) {
  const [currentItem, setCurrentItem] = useState(item);
  const banner = resolveAssetUrl(currentItem.imageUrl);
  const statusCfg = MARKETING.STATUS_CONFIG[currentItem.status] ?? MARKETING.STATUS_CONFIG.DRAFT;

  useEffect(() => {
    setCurrentItem(item);
  }, [item]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && items.length > 1) {
        setCurrentItem((prev) => {
          const index = items.findIndex((entry) => entry.id === prev.id);
          const nextIndex = index <= 0 ? items.length - 1 : index - 1;
          return items[nextIndex];
        });
      }
      if (e.key === "ArrowRight" && items.length > 1) {
        setCurrentItem((prev) => {
          const index = items.findIndex((entry) => entry.id === prev.id);
          const nextIndex = index >= items.length - 1 ? 0 : index + 1;
          return items[nextIndex];
        });
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [items, onClose]);

  const currentIndex = useMemo(() => items.findIndex((entry) => entry.id === currentItem.id), [currentItem.id, items]);
  const canGoPrev = items.length > 1 && currentIndex > 0;
  const canGoNext = items.length > 1 && currentIndex < items.length - 1;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        style={panelStyle}
      >
        {banner && (
          <div style={{ position: "relative", height: 220 }}>
            <Image src={banner} alt={currentItem.title} fill style={{ objectFit: "cover" }} />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.75))",
            }} />
          </div>
        )}

        <div style={{ padding: "24px 28px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <span style={{ ...badgeStyle, background: statusCfg.bg, color: statusCfg.color }}>
                {statusCfg.label}
              </span>
              <span style={badgeStyle}>{currentItem.type}</span>
              {currentItem.isPinned && (
                <span style={{ ...badgeStyle, color: "#E8692C", background: "rgba(232,105,44,0.12)" }}>
                  <Pin size={10} style={{ marginRight: 4, verticalAlign: -1 }} />
                  Pinned
                </span>
              )}
            </div>
            <button onClick={onClose} style={closeBtnStyle} aria-label="Close preview">
              <X size={16} />
            </button>
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.03em", color: "#0f172a" }}>
            {currentItem.title}
          </h2>
          {currentItem.subtitle && (
            <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 14px" }}>{currentItem.subtitle}</p>
          )}
          <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.75, margin: 0 }}>
            {currentItem.richContent || currentItem.body || "No content provided."}
          </p>

          {items.length > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
              <button
                onClick={() => {
                  const nextIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
                  setCurrentItem(items[nextIndex]);
                }}
                disabled={!canGoPrev}
                style={{ ...navBtnStyle, opacity: canGoPrev ? 1 : 0.45 }}
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <span style={{ fontSize: 12, color: "#64748b" }}>
                {currentIndex + 1} / {items.length}
              </span>
              <button
                onClick={() => {
                  const nextIndex = currentIndex >= items.length - 1 ? 0 : currentIndex + 1;
                  setCurrentItem(items[nextIndex]);
                }}
                disabled={!canGoNext}
                style={{ ...navBtnStyle, opacity: canGoNext ? 1 : 0.45 }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed", inset: 0, zIndex: 1000,
  background: "rgba(15, 23, 42, 0.68)", backdropFilter: "blur(4px)",
  display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
};

const panelStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid rgba(15, 23, 42, 0.08)",
  borderRadius: 16, overflow: "hidden",
  width: "100%", maxWidth: 620,
  boxShadow: "0 24px 64px rgba(15, 23, 42, 0.16)",
  maxHeight: "90vh", overflowY: "auto",
};

const badgeStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center",
  fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
  textTransform: "uppercase", padding: "3px 9px", borderRadius: 99,
  background: "rgba(15, 23, 42, 0.06)", color: "#475569",
};

const closeBtnStyle: React.CSSProperties = {
  background: "#f8fafc", border: "1px solid #e2e8f0",
  borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: "#475569",
};

const navBtnStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6,
  border: "1px solid #e2e8f0", background: "#fff", color: "#0f172a",
  borderRadius: 999, padding: "8px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600,
};
