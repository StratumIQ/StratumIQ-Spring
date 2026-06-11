"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import { TESTIMONIALS, BRAND } from "@/lib/constants";

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 md:py-28 bg-black text-white border-t border-white/[0.08]">
      <Container>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="max-w-2xl mb-12"
        >
          <div style={{
            display:      "inline-flex", alignItems: "center", gap: 8,
            padding:      "5px 12px", borderRadius: 99, marginBottom: 16,
            background:   "rgba(232,105,44,0.1)", border: "1px solid rgba(232,105,44,0.25)",
          }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: BRAND.orange, letterSpacing: "0.08em" }}>
              TESTIMONIALS
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ letterSpacing: "-0.03em" }}>
            Trusted by operators across India
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Quarry owners, dealers, and service providers managing operations with StratumIQ.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((item, index) => (
            <motion.div key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              style={{
                padding:    "28px 26px",
                borderRadius: 16,
                background: "rgba(255,255,255,0.03)",
                border:     "1px solid rgba(255,255,255,0.08)",
                display:    "flex",
                flexDirection: "column",
                gap:        16,
                transition: "border-color .2s",
              }}
              onMouseOver={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)")}
              onMouseOut={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)")}
            >
              {/* ✅ Orange stars */}
              <div style={{ display: "flex", gap: 3 }}>
                {Array.from({ length: item.rating }).map((_, i) => (
                  <svg key={i} width="14" height="14" viewBox="0 0 24 24"
                    fill={BRAND.orange} stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
                {Array.from({ length: 5 - item.rating }).map((_, i) => (
                  <svg key={i} width="14" height="14" viewBox="0 0 24 24"
                    fill="rgba(255,255,255,0.12)" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, flex: 1 }}>
                "{item.quote}"
              </p>

              {/* User */}
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.orangeHover})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0,
                }}>
                  {item.name[0]}
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#fff" }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{item.company}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}