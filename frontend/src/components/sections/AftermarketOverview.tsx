"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import { AFTERMARKET_DATA } from "@/lib/constants";
import Button from "@/components/ui/Button";

export default function AftermarketOverview() {
  return (
    <section
      id="aftermarket"
      className="py-10 md:py-15 bg-black text-white"
    >
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="max-w-2xl mb-5"
        >
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Aftermarket Parts
          </h2>

          <p className="mt-4 text-lg text-gray-400">
            Genuine, compatible, and wear parts to keep your equipment running.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-xl p-10 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] transition"
        >
          <h3 className="text-2xl font-medium mb-6">
            Spare Parts Marketplace
          </h3>

          <ul className="space-y-3 text-gray-400">
            {AFTERMARKET_DATA.parts.map((item) => (
              <li key={item}>&bull; {item}</li>
            ))}
          </ul>

          <Button variant="outline" className="mt-8">
            Explore Parts &rarr;
          </Button>
        </motion.div>
      </Container>
    </section>
  );
}
