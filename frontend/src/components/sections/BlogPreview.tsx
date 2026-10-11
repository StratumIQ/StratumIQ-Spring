"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { BLOG_POSTS } from "@/lib/constants";

export default function BlogPreview() {
  return (
    <section id="blog" className="mkt-section mkt-section--alt">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          viewport={{ once: true }}
          className="mkt-header"
        >
          <div className="mkt-kicker">KNOWLEDGE HUB</div>
          <h2 className="mkt-title">Guides for operations.</h2>
          <p className="mkt-sub">
            Practical articles on equipment selection, maintenance, and wear parts — not invented metrics.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {BLOG_POSTS.map((post) => (
            <motion.article
              key={post.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              viewport={{ once: true }}
              className="mkt-card"
              style={{ padding: 0, overflow: "hidden" }}
            >
              <div className="relative" style={{ height: 180 }}>
                <Image src={post.image} alt="" fill className="object-cover" />
              </div>
              <div style={{ padding: 22 }}>
                <div className="mkt-kicker" style={{ marginBottom: 10 }}>{post.readTime}</div>
                <h3 style={{ marginBottom: 10 }}>{post.title}</h3>
                <p style={{ marginBottom: 16 }}>{post.excerpt}</p>
                <Button href="/auth?mode=register" variant="outline" size="sm">Read in the platform</Button>
              </div>
            </motion.article>
          ))}
        </div>
      </Container>
    </section>
  );
}
