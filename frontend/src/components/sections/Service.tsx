"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { AFTERMARKET_DATA, BRAND } from "@/lib/constants";

const O = BRAND.orange;

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke={O} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// SVG icons — no emojis
const PartsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={O} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);

const ServicesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={O} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07M8.46 8.46a5 5 0 0 0 0 7.07"/>
  </svg>
);

// The 5 service points specified in the business review
const SERVICE_POINTS = [
  "Expert solutions for your equipment",
  "Remote and on-site technical support",
  "Find highly skilled service professionals",
  "Manage service operations",
  "Standardize and document service operations",
];

export default function AftermarketOverview() {
  return (
    <section id="aftermarket" className="py-20 md:py-28 bg-black text-white">
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
            <span style={{ fontSize: 11.5, fontWeight: 700, color: O, letterSpacing: "0.08em" }}>
              AFTERMARKET
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ letterSpacing: "-0.03em" }}>
            Parts. Inventory. <span style={{ color: O }}>Delivered.</span>
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Genuine and compatible parts for crushing and screening equipment — with smart inventory management built in.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 max-w-3xl">

          {/* Parts card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            style={{
              padding: "28px 26px", borderRadius: 16,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              transition: "border-color .2s",
            }}
            onMouseOver={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)")}
            onMouseOut={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)")}
          >
            <div style={{
              width: 38, height: 38, borderRadius: 9,
              background: "rgba(232,105,44,0.12)",
              border: "1px solid rgba(232,105,44,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 16,
            }}>
              <PartsIcon />
            </div>
            <h3 className="text-xl font-bold mb-4">Spare Parts Marketplace</h3>
            <ul style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {AFTERMARKET_DATA.parts.map((item) => (
                <li key={item} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 14, color: "rgba(255,255,255,0.65)" }}>
                  <CheckIcon /> {item}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 22 }}>
              <Button variant="outline" size="sm">Explore Parts →</Button>
            </div>
          </motion.div>

          {/* Services card — updated with the 5 required points */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            style={{
              padding: "28px 26px", borderRadius: 16,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              transition: "border-color .2s",
            }}
            onMouseOver={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)")}
            onMouseOut={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)")}
          >
            <div style={{
              width: 38, height: 38, borderRadius: 9,
              background: "rgba(232,105,44,0.12)",
              border: "1px solid rgba(232,105,44,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 16,
            }}>
              <ServicesIcon />
            </div>
            <h3 className="text-xl font-bold mb-4">Service Support</h3>
            <ul style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {SERVICE_POINTS.map((item) => (
                <li key={item} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 14, color: "rgba(255,255,255,0.65)" }}>
                  <CheckIcon /> {item}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 22 }}>
              <Button variant="outline" size="sm">Explore Services →</Button>
            </div>
          </motion.div>

        </div>
      </Container>
    </section>
  );
}