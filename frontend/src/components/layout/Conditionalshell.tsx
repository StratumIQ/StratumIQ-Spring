"use client";

/**
 * ConditionalShell — StratumIQ
 * Shows Header + Footer on public/marketing pages.
 * Suppresses them on /dashboard/* and /auth (unified auth page handles its own chrome).
 */

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const NO_SHELL = ["/dashboard", "/auth"];

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname() ?? "";
  const showShell = !NO_SHELL.some(p => pathname.startsWith(p));

  if (showShell) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    );
  }

  return <>{children}</>;
}