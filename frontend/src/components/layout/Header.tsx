"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useScrollHeader from "@/hooks/useScrollHeader";
import { NAV_ITEMS } from "@/lib/constants";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";

export default function Header() {
  const scrolled    = useScrollHeader();
  const pathname    = usePathname();
  const [active,      setActive]      = useState("");
  const [mobileOpen,  setMobileOpen]  = useState(false);

  const isAuthPage   = pathname?.startsWith("/auth");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    NAV_ITEMS.forEach(({ href }) => {
      const el = document.querySelector(href);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(href); },
        { rootMargin: "-40% 0px -55% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
      <Container>
        <div className="site-header-inner">
          <Link href="/" className="site-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-icon.png" alt="Stratum IQ" />
          </Link>

          {!isAuthPage && (
            <nav className="site-nav" aria-label="Primary">
              {NAV_ITEMS.map(({ label, href }) => {
                const isActive = active === href;
                return (
                  <button
                    key={label}
                    onClick={() => scrollTo(href)}
                    className={`site-nav-link${isActive ? " is-active" : ""}`}
                  >
                    {label}
                    <span className="site-nav-link-bar" />
                  </button>
                );
              })}
            </nav>
          )}

          <div className="site-header-actions">
            <Button href="/auth?mode=login" variant="ghost" size="md" className="site-header-ghost">
              Sign In
            </Button>
            <Button href="/auth?mode=register" variant="primary" size="md">
              Get Started
            </Button>
            {!isAuthPage && (
              <button
                onClick={() => setMobileOpen((o) => !o)}
                className="site-menu-btn"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round"/></svg>
                )}
              </button>
            )}
          </div>
        </div>
      </Container>

      {mobileOpen && !isAuthPage && (
        <div className="site-drawer">
          {NAV_ITEMS.map(({ label, href }) => (
            <button
              key={label}
              onClick={() => scrollTo(href)}
              className={`site-drawer-link${active === href ? " is-active" : ""}`}
            >
              {label}
            </button>
          ))}
          <div className="site-drawer-actions">
            <Button href="/auth?mode=login" variant="outline" size="md">Sign In</Button>
            <Button href="/auth?mode=register" variant="primary" size="md">Get Started</Button>
          </div>
        </div>
      )}
    </header>
  );
}
