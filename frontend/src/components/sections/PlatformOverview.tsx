"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Container from "@/components/ui/Container";
import { BRAND } from "@/lib/constants";

const items = [
  { title: "Fleet Management",        desc: "Track and manage heavy equipment across all sites in real time.",         image: "/fleet.jpg"    },
  { title: "Aftermarket & Parts",     desc: "Centralized parts catalogue, wear components, and inventory control.",    image: "/parts.jpg"    },
  { title: "Services & Maintenance",  desc: "Preventive maintenance, breakdown tracking, and service workflows.",      image: "/services.jpg" },
  { title: "Equipment Configurator",  desc: "Configure crushing and screening plants for your exact requirements.",   image: "/config.jpg"   },
];

export default function PlatformOverview() {
  return (
    <section id="platform" className="py-20 md:py-28 text-white" style={{ background: "#0B0F19" }}>
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
              PLATFORM OVERVIEW
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ letterSpacing: "-0.03em" }}>
            Everything in one system.
          </h2>
          <p className="text-gray-400 mt-4 text-lg">
            Fleet, parts, services, and intelligent tools — unified for heavy equipment operators.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((item, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="group relative rounded-xl overflow-hidden cursor-pointer"
              style={{ height: 300 }}
            >
              <Image src={item.image} alt={item.title} fill sizes="(max-width:768px)100vw,(max-width:1024px)50vw,25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"/>
              <div className="absolute inset-0 transition duration-500" style={{ background: "rgba(0,0,0,0.68)" }}
                onMouseOver={e => ((e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.48)")}
                onMouseOut={e => ((e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.68)")}
              />
              <div className="absolute bottom-0 p-5 z-10">
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, letterSpacing: "-0.01em" }}>{item.title}</h3>
                <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>{item.desc}</p>
              </div>
              <div className="absolute inset-0 rounded-xl" style={{
                border: "1px solid rgba(255,255,255,0.08)",
                transition: "border-color .2s",
              }}
                onMouseOver={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(232,105,44,0.4)")}
                onMouseOut={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)")}
              />
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}