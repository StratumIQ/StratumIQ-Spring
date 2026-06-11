"use client";

import { BRAND } from "@/lib/constants";

const LINKS = {
  Product: ["Platform", "Fleet View", "Parts Management", "Maintenance", "Configurator"],
  Company: ["About", "Blog", "Careers", "Contact"],
  Legal:   ["Privacy Policy", "Terms of Service", "Cookie Settings"],
};

const SOCIAL = [
  { label: "LinkedIn",  href: "#", path: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z" },
  { label: "Twitter/X", href: "#", path: "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" },
  { label: "YouTube",   href: "#", path: "M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z M9.75 15.02l5.75-3.02-5.75-3.02v6.04z" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: "#0B0F19", borderTop: "1px solid rgba(255,255,255,0.08)", color: "#fff" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "52px clamp(16px,4vw,48px) 0" }}>

        {/* Top grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "clamp(24px,4vw,48px)", marginBottom: 48 }}>

          {/* Brand */}
          <div style={{ gridColumn: "span 1" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${BRAND.orange}, ${BRAND.orangeHover})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
                  <path d="M14 5C14 3.34 12.66 2 11 2H7C4.79 2 4.79 7 7 7H11C13.21 7 13.21 12 11 12H6" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
              </div>
              <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em" }}>
                Stratum <span style={{ color: BRAND.orange }}>IQ</span>
              </span>
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, maxWidth: 200 }}>
              Intelligent platform for heavy equipment fleet management and operations.
            </p>
            {/* Social icons */}
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              {SOCIAL.map(s => (
                <a key={s.label} href={s.href} aria-label={s.label} style={{
                  width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.5)", transition: "all .15s", textDecoration: "none",
                }}
                  onMouseOver={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)"; }}
                  onMouseOut={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d={s.path}/>
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>
                {group}
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 9 }}>
                {links.map(l => (
                  <li key={l}>
                    <a href="#" style={{ fontSize: 13.5, color: "rgba(255,255,255,0.45)", textDecoration: "none", transition: "color .15s" }}
                      onMouseOver={e => ((e.target as HTMLElement).style.color = "#fff")}
                      onMouseOut={e => ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.45)")}
                    >{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "16px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.3)", margin: 0 }}>
            © {year} Stratum IQ. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: 16 }}>
            {["Privacy", "Terms", "Cookies"].map(l => (
              <a key={l} href="#" style={{ fontSize: 12.5, color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color .15s" }}
                onMouseOver={e => ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.7)")}
                onMouseOut={e => ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.3)")}
              >{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}