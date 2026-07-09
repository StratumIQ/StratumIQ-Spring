"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import { cn } from "@/lib/utils";

type Trend = "up" | "down" | "neutral";

type Props = {
  label: string;
  value: string | number;
  subText?: string;
  href?: string;
  icon: React.ReactNode;
  color?: string;
  trend?: Trend;
  trendValue?: string;
  loading?: boolean;
};

const TREND_ICON = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

export default function KpiCard({
  label,
  value,
  subText,
  href,
  icon,
  color = "#E8692C",
  trend = "neutral",
  trendValue,
  loading,
}: Props) {
  const TrendIcon = TREND_ICON[trend];

  const content = (
    <GlassCard hover={!!href} padding="sm" className="d-kpi-card">
      <div className="d-kpi-icon" style={{ color, background: `${color}14`, borderColor: `${color}28` }}>
        {icon}
      </div>
      {loading ? (
        <div className="d-kpi-skeleton">
          <div className="d-skeleton d-skeleton--sm" style={{ height: 11, width: "60%" }} />
          <div className="d-skeleton d-skeleton--md" style={{ height: 18, width: "40%", marginTop: 6 }} />
        </div>
      ) : (
        <div className="d-kpi-body">
          <div className="d-kpi-label">{label}</div>
          <div className="d-kpi-value">{value}</div>
        </div>
      )}
      {trendValue ? (
        <span className={cn("d-kpi-trend", `d-kpi-trend--${trend}`)}>
          <TrendIcon size={10} />
          {trendValue}
        </span>
      ) : null}
    </GlassCard>
  );

  if (href) {
    return (
      <Link href={href} className="d-kpi-link">
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18 }}>
          {content}
        </motion.div>
      </Link>
    );
  }

  return content;
}
