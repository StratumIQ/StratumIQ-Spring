"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Container from "@/components/ui/Container";

const items = [
  { title: "Fleet Management",        desc: "Track and manage heavy equipment across all sites in real time.",         image: "/fleet.jpg"    },
  { title: "Aftermarket & Parts",     desc: "Centralized parts catalogue, wear components, and inventory control.",    image: "/parts.jpg"    },
  { title: "Services & Maintenance",  desc: "Preventive maintenance, breakdown tracking, and service workflows.",      image: "/services.jpg" },
  { title: "Equipment Configurator",  desc: "Configure crushing and screening plants for your exact requirements.",   image: "/config.jpg"   },
];

export default function PlatformOverview() {
  return (
    <section id="platform" className="mkt-section">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          viewport={{ once: true }}
          className="mkt-header"
        >
          <div className="mkt-kicker">PLATFORM</div>
          <h2 className="mkt-title">Modules that run the operation.</h2>
          <p className="mkt-sub">
            Fleet, parts, services, and configuration tools in one workspace — not a collection of disconnected screens.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              viewport={{ once: true }}
              className="mkt-media-card"
              style={{ minHeight: 260 }}
            >
              <Image src={item.image} alt="" fill sizes="(max-width:768px)100vw,(max-width:1024px)50vw,25vw" className="object-cover" />
              <div className="mkt-media-shade" />
              <div className="mkt-media-copy">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
