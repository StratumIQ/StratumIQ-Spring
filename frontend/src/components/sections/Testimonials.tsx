"use client";

import { motion } from "framer-motion";
import Container from "@/components/ui/Container";

const AUDIENCES = [
  {
    role: "Operators",
    access: "USER role",
    description: "Manage fleet records, equipment, parts, maintenance, and support tickets for their own operations.",
  },
  {
    role: "Dealers",
    access: "DEALER role",
    description: "View fleet and maintenance information with dealer-scoped access defined by the platform permission model.",
  },
  {
    role: "Administrators",
    access: "ADMIN / SUPER_ADMIN",
    description: "Oversee users, fleet, marketing content, parts listings, activity, and support across the platform.",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="mkt-section">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          viewport={{ once: true }}
          className="mkt-header"
        >
          <div className="mkt-kicker">WHO IT SERVES</div>
          <h2 className="mkt-title">One product. Clear roles.</h2>
          <p className="mkt-sub">
            Access is based on the application’s real role model — operators, dealers, and administrators — not fabricated reviews.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {AUDIENCES.map((item, index) => (
            <motion.div
              key={item.role}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.45 }}
              viewport={{ once: true }}
              className="mkt-card"
            >
              <div className="mkt-kicker">{item.access}</div>
              <h3 style={{ fontSize: 18, marginBottom: 10 }}>{item.role}</h3>
              <p>{item.description}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
