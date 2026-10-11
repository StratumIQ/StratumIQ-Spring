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
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-grid">
          <div className="site-footer-brand">
            <div className="site-footer-mark">
              <div className="site-footer-mark-icon" aria-hidden>
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
