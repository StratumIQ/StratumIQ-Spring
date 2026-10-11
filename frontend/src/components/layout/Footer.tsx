"use client";

const LINKS = {
  Product: [
    { label: "Platform", href: "#platform" },
    { label: "Equipment", href: "#equipment" },
    { label: "Parts", href: "#aftermarket" },
    { label: "Services", href: "#services" },
  ],
  Company: [
    { label: "About", href: "#about" },
    { label: "Knowledge hub", href: "#blog" },
    { label: "Sign in", href: "/auth?mode=login" },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: "#0B0F19", borderTop: "1px solid rgba(255,255,255,0.08)", color: "#fff" }}>
      <div className="w-full px-6 sm:px-10 lg:px-16" style={{ paddingTop: 52 }}>

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
              <span className="site-footer-wordmark">
                Stratum <span>IQ</span>
              </span>
            </div>
            <p>Intelligent platform for heavy equipment fleet, parts, and maintenance operations.</p>
          </div>

          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <div className="site-footer-heading">{group}</div>
              <ul className="site-footer-links">
                {links.map((l) => (
                  <li key={l.label}><a href={l.href}>{l.label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="site-footer-bottom">
          <p>© {year} Stratum IQ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
