"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/constants";

const O = BRAND.orange;

export default function Hero() {
  const scrollTo = (id: string) =>
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">

      {/* Background video */}
      <video autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover">
        <source src="/crushingvideo.mp4" type="video/mp4" />
      </video>

      {/* Mobile fallback image */}
      <Image src="/hero-fallback.jpg" alt="Heavy equipment operations"
        fill priority className="absolute inset-0 object-cover md:hidden" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-transparent" />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B0F19] to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Badge */}
          <div style={{
            display:      "inline-flex",
            alignItems:   "center",
            gap:          8,
            padding:      "6px 14px",
            borderRadius: 99,
            background:   "rgba(232,105,44,0.15)",
            border:       "1px solid rgba(232,105,44,0.35)",
            marginBottom: 20,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: O, boxShadow: `0 0 6px ${O}` }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: O, letterSpacing: "0.08em" }}>
              INTELLIGENT FLEET MANAGEMENT
            </span>
          </div>

          <h1 className="text-white font-bold leading-[1.08] tracking-tight"
            style={{ fontSize: "clamp(36px, 6vw, 64px)", letterSpacing: "-0.03em", maxWidth: 700, marginBottom: 20 }}>
            Everything in one system.
          </h1>

          <p style={{ fontSize: "clamp(15px,1.4vw,18px)", color: "rgba(255,255,255,0.6)", maxWidth: 540, lineHeight: 1.7, marginBottom: 32 }}>
            Fleet, parts, services, and intelligent tools — unified for heavy equipment{" "}
            <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>operations.</span>
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/auth/signup" style={{
              display:      "inline-flex",
              alignItems:   "center",
              gap:          8,
              padding:      "0 26px",
              height:       48,
              borderRadius: 10,
              background:   O,
              color:        "#fff",
              fontSize:     14,
              fontWeight:   700,
              textDecoration: "none",
              boxShadow:    `0 0 28px ${BRAND.orangeGlow}`,
              transition:   "all 0.18s",
            }}
              onMouseOver={e => {
                (e.currentTarget as HTMLElement).style.background  = BRAND.orangeHover;
                (e.currentTarget as HTMLElement).style.boxShadow   = "0 0 36px rgba(232,105,44,0.55)";
                (e.currentTarget as HTMLElement).style.transform   = "translateY(-1px)";
              }}
              onMouseOut={e => {
                (e.currentTarget as HTMLElement).style.background  = O;
                (e.currentTarget as HTMLElement).style.boxShadow   = `0 0 28px ${BRAND.orangeGlow}`;
                (e.currentTarget as HTMLElement).style.transform   = "";
              }}
            >
              Get Started Free
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>

            <button onClick={() => scrollTo("#platform")} style={{
              display:      "inline-flex",
              alignItems:   "center",
              gap:          8,
              padding:      "0 22px",
              height:       48,
              borderRadius: 10,
              background:   "rgba(255,255,255,0.08)",
              border:       "1px solid rgba(255,255,255,0.18)",
              color:        "#fff",
              fontSize:     14,
              fontWeight:   600,
              cursor:       "pointer",
              fontFamily:   "inherit",
              transition:   "all 0.18s",
            }}
              onMouseOver={e => {
                (e.currentTarget as HTMLElement).style.background   = "rgba(255,255,255,0.14)";
                (e.currentTarget as HTMLElement).style.borderColor  = "rgba(255,255,255,0.3)";
              }}
              onMouseOut={e => {
                (e.currentTarget as HTMLElement).style.background   = "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLElement).style.borderColor  = "rgba(255,255,255,0.18)";
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Explore Platform
            </button>
          </div>

          {/* Trust badges */}
          <div style={{ display: "flex", gap: 20, marginTop: 36, flexWrap: "wrap" }}>
            {["Fleet Management", "Parts Inventory", "AI-Powered Alerts", "Dealer Network"].map(b => (
              <div key={b} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={O} strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {b}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position:  "absolute", bottom: 32, left: "50%",
        transform: "translateX(-50%)",
        display:   "flex", flexDirection: "column", alignItems: "center", gap: 6,
        animation: "bounce 2s ease-in-out infinite",
        cursor:    "pointer",
      }} onClick={() => scrollTo("#platform")}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>SCROLL</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50%       { transform: translateX(-50%) translateY(6px); }
        }
      `}</style>
    </section>
  );
}