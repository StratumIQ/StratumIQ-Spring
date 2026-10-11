"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { AFTERMARKET_DATA, BRAND } from "@/lib/constants";

const O = BRAND.orange;

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke={O} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const PartsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={O} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);

const ServicesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={O} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07M8.46 8.46a5 5 0 0 0 0 7.07"/>
  </svg>
);

const SERVICE_POINTS = [
  "Expert solutions for your equipment",
  "Remote and on-site technical support",
  "Find highly skilled service professionals",
  "Manage service operations",
  "Standardize and document service operations",
];

export default function Service() {
  return (
    <section id="aftermarket" className="mkt-section mkt-section--alt">
      <div id="services" />
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          viewport={{ once: true }}
          className="mkt-header"
        >
          <div className="mkt-kicker">AFTERMARKET</div>
          <h2 className="mkt-title">Parts. Inventory. <span>Support.</span></h2>
          <p className="mkt-sub">
            Genuine and compatible parts for crushing and screening equipment, with service operations in the same workspace.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mkt-card"
          >
            <div className="mkt-icon"><PartsIcon /></div>
            <h3 className="text-lg font-bold mb-4">Spare parts marketplace</h3>
            <ul className="mkt-list">
              {AFTERMARKET_DATA.parts.map((item) => (
                <li key={item}><CheckIcon /> {item}</li>
              ))}
            </ul>
            <div className="mt-6">
              <Button href="/auth?mode=register" variant="outline" size="md">Explore parts</Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            viewport={{ once: true }}
            className="mkt-card"
          >
            <div className="mkt-icon"><ServicesIcon /></div>
            <h3 className="text-lg font-bold mb-4">Service support</h3>
            <ul className="mkt-list">
              {SERVICE_POINTS.map((item) => (
                <li key={item}><CheckIcon /> {item}</li>
              ))}
            </ul>
            <div className="mt-6">
              <Button href="/auth?mode=register" variant="outline" size="md">Explore services</Button>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
