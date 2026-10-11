"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Container from "@/components/ui/Container";
import { EQUIPMENT_CATEGORIES } from "@/lib/constants";

const EXCLUDED_CATEGORIES = ["Attachments", "Consumables"];

export default function EquipmentCategories() {
  const visibleCategories = EQUIPMENT_CATEGORIES.filter(
    (item) => !EXCLUDED_CATEGORIES.includes(item.title)
  );

  return (
    <section id="equipment" className="mkt-section mkt-section--alt">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          viewport={{ once: true }}
          className="mkt-header"
        >
          <div className="mkt-kicker">EQUIPMENT</div>
          <h2 className="mkt-title">Every category. <span>One platform.</span></h2>
          <p className="mkt-sub">
            Crushing, screening, material handling, and more — browse and manage equipment types from a single catalogue.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {visibleCategories.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.45 }}
              viewport={{ once: true }}
              className="mkt-media-card"
            >
              <Image src={item.image} alt={item.title} fill className="object-cover" />
              <div className="mkt-media-shade" />
              <div className="mkt-media-copy">
                <h3>{item.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
