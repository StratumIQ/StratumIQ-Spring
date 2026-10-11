"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Button from "@/components/ui/Button";

export default function Hero() {
  const scrollTo = (id: string) =>
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="hero">
      <video autoPlay muted loop playsInline className="hero-media">
        <source src="/crushingvideo.mp4" type="video/mp4" />
      </video>

      <Image
        src="/hero-fallback.jpg"
        alt=""
        fill
        priority
        className="hero-media md:hidden"
      />

      <div className="hero-overlay" />
      <div className="hero-fade" />

      <div className="hero-content">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mkt-kicker" style={{ background: "rgba(232,105,44,0.16)", borderColor: "rgba(232,105,44,0.4)", color: "#FDBA74" }}>
            INTELLIGENT FLEET MANAGEMENT
          </div>

          <h1>Everything in one system.</h1>
          <p className="hero-lead">
            Fleet, parts, services, and operational tools — unified for heavy equipment operations.
          </p>

          <div className="hero-actions">
            <Button href="/auth?mode=register" variant="primary" size="lg">
              Get started
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Button>
            <Button variant="ghost" size="lg" className="ui-btn--on-dark" onClick={() => scrollTo("#platform")}>
              Explore platform
            </Button>
          </div>

          <div className="hero-trust">
            {["Fleet management", "Parts inventory", "Maintenance workflows", "Dealer network"].map((b) => (
              <div key={b} className="hero-trust-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#E8692C" strokeWidth="2.5" aria-hidden>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {b}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <button className="hero-scroll" onClick={() => scrollTo("#platform")} aria-label="Scroll to platform overview">
        SCROLL
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </section>
  );
}
