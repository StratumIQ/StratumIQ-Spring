"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { BLOG_POSTS, BRAND } from "@/lib/constants";

const O = BRAND.orange;

const GraduationCapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={O} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

export default function BlogPreview() {
  return (
    <section id="blog" className="py-20 md:py-28 bg-black text-white border-t border-white/[0.08]">
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
              KNOWLEDGE HUB
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ letterSpacing: "-0.03em" }}>
            Insights for operations.
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Guides, best practices, and expert knowledge for crushing and screening operations.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {BLOG_POSTS.map((post, index) => (
            <motion.article key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.09, duration: 0.6 }}
              viewport={{ once: true }}
              className="group rounded-xl overflow-hidden"
              style={{
                background:    "rgba(255,255,255,0.03)",
                border:        "1px solid rgba(255,255,255,0.08)",
                transition:    "border-color .2s",
                display:       "flex",
                flexDirection: "column",
              }}
              onMouseOver={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)")}
              onMouseOut={e => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)")}
            >
              <div className="relative overflow-hidden" style={{ height: 200 }}>
                <Image src={post.image} alt={post.title} fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"/>
              </div>
              <div style={{ padding: "22px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 11, color: O, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8 }}>
                  {post.readTime}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.4, marginBottom: 10, flex: 1 }}>
                  {post.title}
                </h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 16 }}>
                  {post.excerpt}
                </p>
                <Button variant="outline" size="sm">Read more →</Button>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Training Hub CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.2 }}
          viewport={{ once: true }}
          style={{
            marginTop: 48,
            padding: "28px 32px",
            borderRadius: 16,
            background: "rgba(232,105,44,0.06)",
            border: "1px solid rgba(232,105,44,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 11,
              background: "rgba(232,105,44,0.12)",
              border: "1px solid rgba(232,105,44,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <GraduationCapIcon />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4, letterSpacing: "-0.02em" }}>
                StratumIQ Training Hub
              </p>
              <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
                Explore StratumIQ training hub to improve your workforce capability and increase efficiency.
              </p>
            </div>
          </div>
          <button style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "10px 20px", borderRadius: 9,
            background: O, color: "#fff",
            fontSize: 13.5, fontWeight: 700,
            border: "none", cursor: "pointer", fontFamily: "inherit",
            whiteSpace: "nowrap", flexShrink: 0,
            transition: "all 0.18s",
          }}
            onMouseOver={e => ((e.currentTarget as HTMLElement).style.background = BRAND.orangeHover)}
            onMouseOut={e => ((e.currentTarget as HTMLElement).style.background = O)}
          >
            Explore Training Hub
            <ArrowRightIcon />
          </button>
        </motion.div>

      </Container>
    </section>
  );
}