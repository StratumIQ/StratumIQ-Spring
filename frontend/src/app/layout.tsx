/**
 * Root Layout — StratumIQ
 * FONT STRATEGY: next/font/google injects fonts at build time.
 * CSS @import url() for Google Fonts does NOT work reliably in Next.js —
 * it gets blocked by CSP headers and misses SSR. Always use next/font.
 */

import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import "./globals.css";
import ConditionalShell from "@/components/layout/Conditionalshell";

/* ── Font definitions ─────────────────────────────────────── */
const dmSans = DM_Sans({
  subsets:  ["latin"],
  weight:   ["300", "400", "500", "600", "700", "800"],
  variable: "--font-body",
  display:  "swap",
});

const syne = Syne({
  subsets:  ["latin"],
  weight:   ["600", "700", "800"],
  variable: "--font-heading",
  display:  "swap",
});

export const metadata: Metadata = {
  title:       "Stratum IQ — Intelligent Platform for Heavy Equipment",
  description: "Manage fleet, parts, maintenance, and services for heavy equipment operations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${syne.variable}`}>
      <body>
        <ConditionalShell>{children}</ConditionalShell>
      </body>
    </html>
  );
}