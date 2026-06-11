"use client";

/**
 * Sidebar — StratumIQ Dashboard
 * ─────────────────────────────────────────────────────────────
 * Uses only CSS classes from dashboard.css — zero inline styles.
 * All hover/active states driven by CSS, not onMouseOver handlers.
 * ─────────────────────────────────────────────────────────────
 */

import Link      from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { API_URL } from "@/lib/constants";

// ── Icons ─────────────────────────────────────────────────────
const Icons = {
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  equipment: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <path d="M14 2v6h6M9 13h6M9 17h4"/>
    </svg>
  ),
  fleet: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="2"/>
      <path d="M16 8h4l3 3v5h-7V8z"/>
      <circle cx="5.5" cy="18.5" r="2.5"/>
      <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
  parts: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
    </svg>
  ),
  maintenance: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  ),
  configurator: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <path d="M8 21h8M12 17v4"/>
    </svg>
  ),
  analytics: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18"/>
      <path d="M18 9l-5 5-4-4-3 3"/>
    </svg>
  ),
  alerts: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  ),
  training: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
    </svg>
  ),
  settings: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  ),
  logout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  chevron: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  ),
  logo: (
    <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
      <path d="M14 5C14 3.34 12.66 2 11 2H7C4.79 2 4.79 7 7 7H11C13.21 7 13.21 12 11 12H6"
        stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  ),
  close: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  ),
};

// ── Nav structure ──────────────────────────────────────────────
const NAV_GROUPS = [
  {
    group: "Operations",
    items: [
      { label: "Dashboard",        href: "/dashboard",              exact: true, icon: Icons.dashboard    },
      { label: "Equipment",        href: "/dashboard/equipment",                 icon: Icons.equipment    },
      { label: "My Fleet",         href: "/dashboard/fleet",                     icon: Icons.fleet        },
      { label: "Parts Management", href: "/dashboard/parts",                     icon: Icons.parts        },
      { label: "Maintenance",      href: "/dashboard/maintenance",               icon: Icons.maintenance  },
      { label: "Configurator",     href: "/dashboard/configurator",              icon: Icons.configurator },
    ],
  },
  {
    group: "Intelligence",
    items: [
      { label: "Analytics", href: "/dashboard/solutions", icon: Icons.analytics },
      { label: "Alerts",    href: "/dashboard/alerts",    icon: Icons.alerts    },
    ],
  },
];

const BOTTOM_ITEMS = [
  { label: "Training", href: "/dashboard/training", icon: Icons.training },
  { label: "Settings", href: "/dashboard/settings", icon: Icons.settings },
];

// ── Component ──────────────────────────────────────────────────
export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname() ?? "";
  const router   = useRouter();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const handleLogout = () => {
    localStorage.removeItem("token");
    fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" })
      .finally(() => router.push("/auth"));
  };

  return (
    <aside className="sb">

      {/* ── Logo ── */}
      <div className="sb-logo-strip">
        <Link href="/dashboard" className="sb-logo-link" onClick={onClose}>
          <div className="sb-logo-icon">{Icons.logo}</div>
          <div className="sb-logo-text">
            <b>Stratum<span>IQ</span></b>
          </div>
        </Link>

        {onClose && (
          <button
            className="sb-close-btn"
            onClick={onClose}
            aria-label="Close navigation"
          >
            {Icons.close}
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="sb-nav" aria-label="Main navigation">
        {NAV_GROUPS.map(group => (
          <div key={group.group} className="sb-group">
            <div className="sb-group-label">{group.group}</div>
            {group.items.map(item => {
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`sb-item${active ? " active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="sb-item-inner">
                    <span className="sb-item-icon">{item.icon}</span>
                    <span className="sb-item-label">{item.label}</span>
                  </span>
                  <span className="sb-item-arrow">{Icons.chevron}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Bottom ── */}
      <div className="sb-bottom">
        {BOTTOM_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`sb-item${isActive(item.href) ? " active" : ""}`}
          >
            <span className="sb-item-inner">
              <span className="sb-item-icon">{item.icon}</span>
              <span className="sb-item-label">{item.label}</span>
            </span>
          </Link>
        ))}

        <button className="sb-logout-btn" onClick={handleLogout}>
          <span className="sb-item-icon">{Icons.logout}</span>
          <span>Sign out</span>
        </button>

        <div className="sb-footer">
          <div className="sb-footer-title">StratumIQ Platform</div>
          <div className="sb-footer-sub">v1.0 · Fleet Module Active</div>
        </div>
      </div>
    </aside>
  );
}