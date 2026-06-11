"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import { WHY_CHOOSE_DATA, BRAND } from "@/lib/constants";

export default function WhyChoose() {
  return (
    <section id="about" className="py-20 md:py-28 bg-black text-white border-t border-white/[0.08]">
      <Container>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="max-w-2xl mb-12"
        >
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 12px", borderRadius: 99, marginBottom: 16,
            background: "rgba(232,105,44,0.1)", border: "1px solid rgba(232,105,44,0.25)",
          }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: BRAND.orange, letterSpacing: "0.08em" }}>
              WHY STRATUM IQ
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ letterSpacing: "-0.03em" }}>
            Built differently. <span style={{ color: BRAND.orange }}>For this industry.</span>
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Purpose-built for quarry and crushing operations — combining marketplace, services, and intelligent tools.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_CHOOSE_DATA.map((item, i) => (
            <motion.div key={item.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
              viewport={{ once: true }}
              style={{
                padding:      "26px 24px",
                borderRadius: 16,
                background:   "rgba(255,255,255,0.03)",
                border:       "1px solid rgba(255,255,255,0.08)",
                transition:   "all .2s",
              }}
              onMouseOver={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(232,105,44,0.3)";
                (e.currentTarget as HTMLElement).style.background  = "rgba(232,105,44,0.04)";
              }}
              onMouseOut={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLElement).style.background  = "rgba(255,255,255,0.03)";
              }}
            >
              {/* Icon */}
              <div style={{
                width:       40, height: 40, borderRadius: 10,
                background:  "rgba(232,105,44,0.12)",
                border:      "1px solid rgba(232,105,44,0.2)",
                display:     "flex", alignItems: "center", justifyContent: "center",
                fontSize:    18, marginBottom: 16,
              }}>
                {item.icon}
              </div>

              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 8, letterSpacing: "-0.02em" }}>
                {item.title}
              </h3>
              <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.65 }}>
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}