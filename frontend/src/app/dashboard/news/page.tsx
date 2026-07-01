"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, Pin, Newspaper, Eye, FileText } from "lucide-react";
import PageShell from "@/components/dashboard/layout/PageShell";
import KpiCard from "@/components/dashboard/common/KpiCard";
import Skeleton from "@/components/dashboard/ui/Skeleton";
import { getAllDashboardMarketing } from "@/lib/api/dashboardMarketing";
import { resolveAssetUrl } from "@/lib/constants";

const PAGE_SIZE = 12;

export default function NewsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", "marketing", "all", page],
    queryFn: () => getAllDashboardMarketing(page, PAGE_SIZE),
  });

  const items = data?.marketing ?? [];
  const pagination = data?.pagination;

  return (
    <PageShell title="News & Announcements" description="All published updates from StratumIQ">
      <Link href="/dashboard" style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontSize: 13, fontWeight: 600, color: "var(--d-text2, #94a3b8)",
        textDecoration: "none", marginBottom: 20,
      }}>
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <div className="d-kpi-grid" style={{ marginBottom: 8 }}>
        <KpiCard label="Total" value={pagination?.total ?? items.length ?? 0} icon={<Newspaper size={18} />} color="#E8692C" loading={isLoading} />
        <KpiCard label="Pinned" value={items.filter((i) => i.isPinned).length} icon={<Pin size={18} />} color="#2563EB" loading={isLoading} />
        <KpiCard label="Published" value={(items.filter((i) => i.status === "PUBLISHED").length) ?? items.length} icon={<FileText size={18} />} color="#7C3AED" loading={isLoading} />
        <KpiCard label="Shown" value={0} icon={<Eye size={18} />} color="#E8692C" loading={isLoading} />
      </div>

      {isLoading ? (
        <div style={{ display: "grid", gap: 16 }}>
          {[1, 2, 3].map((i) => <Skeleton key={i} height={160} rounded="lg" />)}
        </div>
      ) : items.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "60px 24px",
          background: "rgba(232,105,44,0.04)", borderRadius: 14,
          border: "1px solid rgba(232,105,44,0.15)",
        }}>
          <Newspaper size={36} color="#64748b" style={{ marginBottom: 12 }} />
          <p style={{ color: "var(--d-text2, #94a3b8)", fontSize: 14 }}>No announcements at this time.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {items.map((item, i) => {
            const banner = resolveAssetUrl(item.imageUrl);
            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
                style={{
                  borderRadius: 14, overflow: "hidden",
                  border: "1px solid var(--d-border, rgba(255,255,255,0.08))",
                  background: "var(--d-surface, #1a1f2e)",
                }}
              >
                {banner && (
                  <div style={{ position: "relative", height: 180 }}>
                    <Image src={banner} alt={item.title} fill style={{ objectFit: "cover" }} loading="lazy" />
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.6))",
                    }} />
                  </div>
                )}

                <div style={{ padding: "20px 24px 24px" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
                    <span style={badgeStyle}>{item.type.replace(/_/g, " ")}</span>
                    {item.isPinned && (
                      <span style={{ ...badgeStyle, color: "#E8692C" }}>
                        <Pin size={10} style={{ marginRight: 4, verticalAlign: -1 }} /> Pinned
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: "#475569", marginLeft: "auto" }}>
                      {item.startsAt
                        ? new Date(item.startsAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                        : new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>

                  <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
                    {item.title}
                  </h2>
                  {item.subtitle && (
                    <p style={{ fontSize: 13, color: "var(--d-text2, #94a3b8)", margin: "0 0 10px" }}>{item.subtitle}</p>
                  )}
                  <p style={{ fontSize: 13, color: "var(--d-text2, #94a3b8)", lineHeight: 1.65, margin: 0 }}>
                    {item.body || item.richContent}
                  </p>

                  {item.ctaUrl && (
                    <a href={item.ctaUrl} target="_blank" rel="noopener noreferrer" style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      marginTop: 16, padding: "8px 16px", borderRadius: 8,
                      background: "#E8692C", color: "#fff", fontWeight: 700,
                      fontSize: 12, textDecoration: "none",
                    }}>
                      {item.ctaText || "Learn More"} <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 28 }}>
          <button className="d-btn d-btn-ghost" disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)} style={{ padding: "8px 12px" }}>
            <ChevronLeft size={14} />
          </button>
          <span style={{ fontSize: 13, color: "var(--d-text2, #94a3b8)" }}>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button className="d-btn d-btn-ghost" disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)} style={{ padding: "8px 12px" }}>
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </PageShell>
  );
}

const badgeStyle: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
  textTransform: "uppercase", padding: "3px 9px", borderRadius: 99,
  background: "rgba(232,105,44,0.1)", color: "#E8692C",
  border: "1px solid rgba(232,105,44,0.25)",
};
