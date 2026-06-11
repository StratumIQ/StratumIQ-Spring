"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useScrollHeader from "@/hooks/useScrollHeader";
import { NAV_ITEMS, BRAND } from "@/lib/constants";
import Container from "@/components/ui/Container";

const O = BRAND.orange;

export default function Header() {
  const scrolled    = useScrollHeader();
  const pathname    = usePathname();
  const [active,      setActive]      = useState("");
  const [mobileOpen,  setMobileOpen]  = useState(false);

  const isAuthPage   = pathname?.startsWith("/auth");

  /* Track active section via IntersectionObserver */
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
    <>
      <header
        style={{
          position:          "fixed",
          top: 0, left: 0,
          width:             "100%",
          zIndex:            50,
          transition:        "all 0.3s",
          background:        scrolled ? "rgba(3,9,20,0.88)" : "transparent",
          backdropFilter:    scrolled ? "blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
          borderBottom:      scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        }}
      >
        <Container>
          <div style={{ height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>

            {/* Logo */}
            <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-icon.png" alt="Stratum IQ" style={{ height: 88, width: 130 }} />
            </Link>

            {/* Desktop Nav */}
            {!isAuthPage && (
              <nav style={{ display: "flex", alignItems: "center", gap: 36, marginLeft: "clamp(24px,4vw,64px)" }}
                className="hidden-mobile">
                {NAV_ITEMS.map(({ label, href }) => {
                  const isActive = active === href;
                  return (
                    <button key={label} onClick={() => scrollTo(href)}
                      style={{
                        position:       "relative",
                        background:     "none",
                        border:         "none",
                        cursor:         "pointer",
                        padding:        "4px 0",
                        fontSize:       14,
                        fontWeight:     600,
                        letterSpacing:  "0.01em",
                        color:          isActive ? "#fff" : "rgba(255,255,255,0.55)",
                        transition:     "color 0.2s",
                        fontFamily:     "inherit",
                      }}
                      onMouseOver={e => ((e.currentTarget as HTMLElement).style.color = "#fff")}
                      onMouseOut={e => {
                        if (!isActive) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)";
                      }}
                    >
                      {label}
                      <span style={{
                        position:   "absolute",
                        bottom:     -2, left: 0,
                        height:     1.5,
                        width:      isActive ? "100%" : "0%",
                        background: O,
                        borderRadius: 99,
                        transition: "width 0.25s",
                      }} />
                    </button>
                  );
                })}
              </nav>
            )}

            {/* Auth Buttons — both point to /auth with ?mode= */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
              {/* Sign In */}
              <Link href="/auth?mode=login" style={{
                display:        "inline-flex",
                alignItems:     "center",
                height:         36,
                padding:        "0 18px",
                borderRadius:   8,
                fontSize:       13,
                fontWeight:     600,
                textDecoration: "none",
                color:          "rgba(255,255,255,0.75)",
                background:     "transparent",
                border:         "1px solid rgba(255,255,255,0.15)",
                transition:     "all 0.18s",
              }}
                onMouseOver={e => {
                  (e.currentTarget as HTMLElement).style.background  = "rgba(232,105,44,0.08)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(232,105,44,0.5)";
                  (e.currentTarget as HTMLElement).style.color       = "#fff";
                }}
                onMouseOut={e => {
                  (e.currentTarget as HTMLElement).style.background  = "transparent";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
                  (e.currentTarget as HTMLElement).style.color       = "rgba(255,255,255,0.75)";
                }}
              >Sign In</Link>

              {/* Get Started */}
              <Link href="/auth?mode=register" style={{
                display:        "inline-flex",
                alignItems:     "center",
                height:         36,
                padding:        "0 18px",
                borderRadius:   8,
                fontSize:       13,
                fontWeight:     600,
                textDecoration: "none",
                color:          "#fff",
                background:     O,
                border:         "none",
                transition:     "all 0.18s",
                boxShadow:      `0 0 18px ${BRAND.orangeGlow}`,
              }}
                onMouseOver={e => {
                  (e.currentTarget as HTMLElement).style.background  = BRAND.orangeHover;
                  (e.currentTarget as HTMLElement).style.boxShadow   = "0 0 24px rgba(232,105,44,0.55)";
                }}
                onMouseOut={e => {
                  (e.currentTarget as HTMLElement).style.background  = O;
                  (e.currentTarget as HTMLElement).style.boxShadow   = `0 0 18px ${BRAND.orangeGlow}`;
                }}
              >Get Started</Link>

              {/* Mobile hamburger */}
              {!isAuthPage && (
                <button onClick={() => setMobileOpen(o => !o)} className="show-mobile"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", padding: 4, display: "none" }}>
                  {mobileOpen
                    ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/></svg>
                    : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round"/></svg>
                  }
                </button>
              )}
            </div>
          </div>
        </Container>

        {/* Mobile drawer */}
        {mobileOpen && !isAuthPage && (
          <div style={{ background: "rgba(3,9,20,0.97)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "12px 20px 20px" }}>
            {NAV_ITEMS.map(({ label, href }) => (
              <button key={label} onClick={() => scrollTo(href)} style={{
                display: "block", width: "100%", textAlign: "left",
                background: "none", border: "none", cursor: "pointer",
                padding: "11px 0", fontSize: 15,
                color: active === href ? O : "rgba(255,255,255,0.6)",
                fontWeight: 500, fontFamily: "inherit",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}>
                {label}
              </button>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <Link href="/auth?mode=login" style={{
                flex: 1, textAlign: "center", padding: "10px",
                borderRadius: 8, fontSize: 13, fontWeight: 600,
                color: "#fff", textDecoration: "none",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}>Sign In</Link>
              <Link href="/auth?mode=register" style={{
                flex: 1, textAlign: "center", padding: "10px",
                borderRadius: 8, fontSize: 13, fontWeight: 600,
                color: "#fff", textDecoration: "none", background: O,
              }}>Get Started</Link>
            </div>
          </div>
        )}
      </header>

      <style>{`
        @media (max-width: 767px) {
          .hidden-mobile { display: none !important; }
          .show-mobile   { display: flex !important; }
        }
      `}</style>
    </>
  );
}