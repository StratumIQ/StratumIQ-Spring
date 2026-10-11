"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import { WHY_CHOOSE_DATA, BRAND } from "@/lib/constants";
import {
  Settings2, Truck, MapPin, BadgeCheck, BrainCircuit, ShieldCheck,
  LucideProps,
} from "lucide-react";
import type { FC } from "react";

const O = BRAND.orange;

const ICON_MAP: Record<string, FC<LucideProps>> = {
  Settings2,
  Truck,
  MapPin,
  BadgeCheck,
  BrainCircuit,
  ShieldCheck,
};

export default function WhyChoose() {
  return (
    <section id="about" className="mkt-section">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          viewport={{ once: true }}
          className="mkt-header"
        >
          <div className="mkt-kicker">WHY STRATUM IQ</div>
          <h2 className="mkt-title">Built for this industry.</h2>
          <p className="mkt-sub">
            Purpose-built for quarry and crushing operations — combining marketplace, services, and operational tools.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_CHOOSE_DATA.map((item, i) => {
            const IconComponent = ICON_MAP[item.icon];
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.45 }}
                viewport={{ once: true }}
                className="mkt-card"
              >
                <div className="mkt-icon">
                  {IconComponent ? <IconComponent size={18} color={O} strokeWidth={1.8} /> : null}
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
