"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Newspaper } from "lucide-react";
import { getDashboardMarketing, DashboardMarketingItem } from "@/lib/api/dashboardMarketing";
import { MARKETING, resolveAssetUrl } from "@/lib/constants";

// ─── Full-content modal ───────────────────────────────────────────────────────
function NewsModal({ item, onClose }: { item: DashboardMarketingItem; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const banner = resolveAssetUrl(item.imageUrl);

  return (
    <div style={modalOverlay} onClick={onClose} role="dialog" aria-modal="true" aria-label={item.title}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        style={modalPanel}
      >
        {banner && (
          <div style={{ position: "relative", height: 240, width: "100%" }}>
            <Image src={banner} alt={item.title} fill style={{ objectFit: "cover" }} />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.7))",
            }} />
          </div>
        )}

        <div style={{ padding: "24px 28px 28px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
            <div>
              <span style={typeBadge}>{item.type.replace(/_/g, " ")}</span>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--d-text, #f1f5f9)", letterSpacing: "-0.03em", margin: "10px 0 0" }}>
                {item.title}
              </h2>
              {item.subtitle && (
                <p style={{ fontSize: 14, color: "var(--d-text2, #94a3b8)", margin: "6px 0 0" }}>{item.subtitle}</p>
              )}
            </div>
            <button onClick={onClose} aria-label="Close" style={closeBtn}>
              <X size={16} />
            </button>
          </div>

          <p style={{ fontSize: 14, color: "var(--d-text2, #94a3b8)", lineHeight: 1.75, margin: 0 }}>
            {item.richContent || item.body || "No additional details available."}
          </p>

          <button type="button" onClick={onClose} style={ctaBtn}>
            {item.ctaText || "Close"}
          </button>

          <div style={{ marginTop: 22, fontSize: 11, color: "#475569" }}>
            {item.startsAt
              ? new Date(item.startsAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
              : item.createdAt
                ? new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                : ""}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main slider ──────────────────────────────────────────────────────────────
export default function MarketingNewsSlider() {
  const [news, setNews]         = useState<DashboardMarketingItem[]>([]);
  const [current, setCurrent]   = useState(0);
  const [selected, setSelected] = useState<DashboardMarketingItem | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const timerRef                = useRef<ReturnType<typeof setInterval> | null>(null);
  const pauseTimerRef           = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX             = useRef(0);
  const containerRef            = useRef<HTMLDivElement>(null);

  // ─── Load marketing data ──────────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      const res = await getDashboardMarketing();
      setNews(Array.isArray(res) ? res : []);
      setCurrent(0);
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ─── Visibility monitoring (pause when tab/element not visible) ────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    
    if (containerRef.current) observer.observe(containerRef.current);
    
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === "visible");
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // ─── Determine if autoplay should be active ───────────────────────────────
  const shouldAutoplay = news.length > 1 && !isHovering && isVisible;

  // ─── Start/restart autoplay interval ──────────────────────────────────────
  const startAutoplay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!shouldAutoplay) return;
    
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % news.length);
    }, MARKETING.AUTO_PLAY_MS);
  }, [shouldAutoplay, news.length]);

  // ─── Stop autoplay and schedule resume ────────────────────────────────────
  const pauseAutoplayTemporarily = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    
    // Resume after delay (unless user is hovering or element is not visible)
    pauseTimerRef.current = setTimeout(() => {
      if (shouldAutoplay) startAutoplay();
    }, MARKETING.PAUSE_RESUME_DELAY_MS);
  }, [shouldAutoplay, startAutoplay]);

  // ─── Auto-start interval when data loads or visibility/hover changes ──────
  useEffect(() => {
    if (shouldAutoplay) {
      startAutoplay();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [shouldAutoplay, startAutoplay]);

  // ─── Navigation with pause/resume ────────────────────────────────────────
  const navigate = useCallback((dir: 1 | -1) => {
    setCurrent((prev) => (prev + dir + news.length) % news.length);
    pauseAutoplayTemporarily();
  }, [news.length, pauseAutoplayTemporarily]);

  // ─── Touch/Swipe support ────────────────────────────────────────────────
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      navigate(diff > 0 ? 1 : -1);
    }
  };

  // ─── Keyboard navigation ──────────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (selected || news.length <= 1) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); navigate(-1); }
      if (e.key === "ArrowRight") { e.preventDefault(); navigate(1); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [news.length, selected, navigate]);

  // ─── Cleanup on unmount ──────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
  }, []);

  if (news.length === 0) return null;

  const item = news[current];
  const banner = resolveAssetUrl(item.imageUrl);
  const hasBanner = !!banner;

  return (
    <>
      {selected && <NewsModal item={selected} onClose={() => setSelected(null)} />}

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Newspaper size={15} color="#E8692C" />
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--d-text, #f1f5f9)" }}>Latest Updates</span>
          </div>
          <Link href="/dashboard/news" style={{
            fontSize: 12, fontWeight: 600, color: "#E8692C", textDecoration: "none",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            View All <ChevronRight size={13} />
          </Link>
        </div>

        <div
          ref={containerRef}
          style={{
            position: "relative", borderRadius: 14, overflow: "hidden",
            cursor: "pointer", minHeight: hasBanner ? 200 : 90,
            background: hasBanner ? "transparent" : "rgba(232,105,44,0.06)",
            border: `1px solid ${hasBanner ? "transparent" : "rgba(232,105,44,0.2)"}`,
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={() => setSelected(item)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          role="region"
          aria-label="Marketing news slider"
          aria-live="polite"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              style={{ position: "absolute", inset: 0 }}
            >
              {hasBanner && (
                <>
                  <Image src={banner} alt="" fill style={{ objectFit: "cover" }} loading="lazy" />
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(90deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.52) 55%, rgba(0,0,0,0.18) 100%)",
                  }} />
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div style={{
            position: "relative", zIndex: 2,
            padding: hasBanner ? "24px 28px" : "16px 20px",
            minHeight: hasBanner ? 200 : "auto",
            display: "flex", flexDirection: "column", justifyContent: "flex-end",
          }}>
            {item.isPinned && (
              <span style={{ ...typeBadge, marginBottom: 8, alignSelf: "flex-start" }}>Pinned</span>
            )}

            <h3 style={{
              fontSize: hasBanner ? 17 : 14, fontWeight: 700,
              color: hasBanner ? "#fff" : "var(--d-text, #f1f5f9)",
              letterSpacing: "-0.02em", margin: "0 0 6px", lineHeight: 1.3,
            }}>
              {item.title}
            </h3>

            {(item.subtitle || (!hasBanner && item.body)) && (
              <p style={{
                fontSize: 12.5,
                color: hasBanner ? "rgba(255,255,255,0.7)" : "var(--d-text2, #94a3b8)",
                margin: "0 0 10px", lineHeight: 1.55,
                overflow: "hidden", textOverflow: "ellipsis",
                display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
              }}>
                {item.subtitle || item.body}
              </p>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelected(item);
              }}
              style={{ ...ctaBtn, alignSelf: "flex-start", marginBottom: 12, fontSize: 12, padding: "7px 14px" }}
            >
              {item.ctaText || "View News"}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }} onClick={(e) => e.stopPropagation()}>
              {news.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrent(i);
                    pauseAutoplayTemporarily();
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                  style={{
                    width: i === current ? 18 : 7, height: 7,
                    borderRadius: 99, border: "none", padding: 0,
                    background: i === current ? "#E8692C" : "rgba(255,255,255,0.25)",
                    cursor: "pointer", transition: "all 0.22s",
                  }}
                />
              ))}
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginLeft: 4 }}>
                {current + 1} / {news.length}
              </span>
            </div>
          </div>

          {news.length > 1 && (
            <>
              <NavArrow dir="left" onClick={() => navigate(-1)} />
              <NavArrow dir="right" onClick={() => navigate(1)} />
            </>
          )}
        </div>
      </div>
    </>
  );
}

function NavArrow({ dir, onClick }: { dir: "left" | "right"; onClick: () => void }) {
  const Icon = dir === "left" ? ChevronLeft : ChevronRight;
  const posStyle: React.CSSProperties = dir === "left" ? { left: 12 } : { right: 12 };
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      aria-label={dir === "left" ? "Previous" : "Next"}
      style={{
        position: "absolute", ...posStyle, top: "50%", transform: "translateY(-50%)",
        zIndex: 3, background: "rgba(0,0,0,0.45)", border: "none",
        borderRadius: 8, padding: "6px 7px", cursor: "pointer",
        color: "#fff", display: "flex", alignItems: "center",
      }}
    >
      <Icon size={16} />
    </button>
  );
}

const modalOverlay: React.CSSProperties = {
  position: "fixed", inset: 0, zIndex: 9999,
  background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)",
  display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
};

const modalPanel: React.CSSProperties = {
  background: "var(--d-surface, #1a1f2e)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 16, overflow: "hidden",
  width: "100%", maxWidth: 620,
  boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
  maxHeight: "90vh", overflowY: "auto",
};

const typeBadge: React.CSSProperties = {
  display: "inline-block", fontSize: 10, fontWeight: 700, color: "#E8692C",
  letterSpacing: "0.08em", textTransform: "uppercase",
  background: "rgba(232,105,44,0.1)", border: "1px solid rgba(232,105,44,0.25)",
  padding: "3px 9px", borderRadius: 99,
};

const closeBtn: React.CSSProperties = {
  background: "rgba(255,255,255,0.08)", border: "none",
  borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: "#94a3b8", flexShrink: 0,
};

const ctaBtn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6,
  marginTop: 4, padding: "10px 18px", borderRadius: 9,
  background: "#E8692C", color: "#fff", fontWeight: 700,
  fontSize: 13, textDecoration: "none",
};
