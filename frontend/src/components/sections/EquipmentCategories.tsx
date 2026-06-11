"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Container from "@/components/ui/Container";
import { EQUIPMENT_CATEGORIES, BRAND } from "@/lib/constants";

export default function EquipmentCategories() {
  return (
    <section id="equipment" className="py-20 md:py-28 bg-black text-white">
      <Container>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mb-12 max-w-2xl"
        >
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 12px", borderRadius: 99, marginBottom: 16,
            background: "rgba(232,105,44,0.1)", border: "1px solid rgba(232,105,44,0.25)",
          }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: BRAND.orange, letterSpacing: "0.08em" }}>
              EQUIPMENT
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ letterSpacing: "-0.03em" }}>
            Every category. <span style={{ color: BRAND.orange }}>One platform.</span>
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Crushing, screening, material handling, and more — browse and manage all equipment types.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {EQUIPMENT_CATEGORIES.map((item, i) => (
            <motion.div key={item.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.55 }}
              viewport={{ once: true }}
              className="group relative rounded-xl overflow-hidden cursor-pointer"
              style={{ height: 200 }}
            >
              <Image src={item.image} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-108"/>
              <div className="absolute inset-0 transition duration-400" style={{ background: "rgba(0,0,0,0.65)" }}
                onMouseOver={e => ((e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.45)")}
                onMouseOut={e => ((e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.65)")}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                <h3 style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em" }}>{item.title}</h3>
              </div>
              <div className="absolute inset-0 rounded-xl transition-all duration-200" style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                onMouseOver={e => ((e.currentTarget as HTMLElement).style.borderColor = `rgba(232,105,44,0.45)`)}
                onMouseOut={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)")}
              />
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}