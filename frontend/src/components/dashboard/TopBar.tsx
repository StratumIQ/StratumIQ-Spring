"use client";

/**
 * TopBar — StratumIQ Dashboard
 * ─────────────────────────────────────────────────────────────
 * Uses only CSS classes from dashboard.css — zero inline styles.
 * No onMouseOver / onMouseOut handlers — all hover via CSS.
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/constants";
import { getToken } from "@/lib/utils";
import type { DashUser, Alert } from "@/types";

// Alert type → CSS dot colour token
const ALERT_DOT: Record<string, string> = {
  critical: "var(--red)",
  warning:  "var(--amber)",
  info:     "var(--blue)",
  success:  "var(--green)",
};

// ── SVG icons ─────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M3 12h18M3 6h18M3 18h18"/>
  </svg>
);

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);

const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M6 9l6 6 6-6"/>
  </svg>
);

// ── Component ──────────────────────────────────────────────────
export default function TopBar({
  user,
  onMenuClick,
}: {
  user: DashUser | null;
  onMenuClick: () => void;
}) {
  const [alerts,     setAlerts]     = useState<Alert[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showUser,   setShowUser]   = useState(false);

  const alertRef = useRef<HTMLDivElement>(null);
  const userRef  = useRef<HTMLDivElement>(null);

  const unread   = alerts.filter(a => !a.is_read).length;
  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  // Fetch alerts on mount
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${API_URL}/dashboard/alerts`, {
      headers:     { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (d?.alerts && Array.isArray(d.alerts)) setAlerts(d.alerts);
      })
      .catch(() => {});
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (alertRef.current && !alertRef.current.contains(e.target as Node))
        setShowAlerts(false);
      if (userRef.current && !userRef.current.contains(e.target as Node))
        setShowUser(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    const token = getToken();
    if (!token) return;
    await fetch(`${API_URL}/dashboard/alerts/read-all`, {
      method:      "PATCH",
      headers:     { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" })
      .finally(() => { window.location.href = "/auth"; });
  };

  return (
    <header className="topbar">

      {/* ── Hamburger (mobile) ── */}
      <button
        className="topbar-menu-btn"
        onClick={onMenuClick}
        aria-label="Toggle navigation"
      >
        <MenuIcon />
      </button>

      {/* ── Search ── */}
      <div className="topbar-search-wrap">
        <span className="topbar-search-icon">
          <SearchIcon />
        </span>
        <input
          className="topbar-search"
          placeholder="Search equipment, parts, or ask AI…"
          aria-label="Search"
        />
      </div>

      <div className="topbar-spacer" />

      {/* ── System status pill ── */}
      <div className={`topbar-status ${unread > 0 ? "warn" : "ok"}`}>
        <span className="topbar-status-dot" />
        {unread > 0 ? `${unread} Alert${unread !== 1 ? "s" : ""}` : "All Clear"}
      </div>

      {/* ── Notification bell ── */}
      <div ref={alertRef} style={{ position: "relative" }}>
        <button
          className="topbar-icon-btn"
          onClick={() => { setShowAlerts(o => !o); setShowUser(false); }}
          aria-label="Notifications"
          aria-expanded={showAlerts}
        >
          <BellIcon />
          {unread > 0 && (
            <span className="topbar-badge">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>

        {showAlerts && (
          <div className="topbar-dropdown" style={{ width: 340 }}>
            <div className="topbar-dropdown-header">
              <span className="topbar-dropdown-title">Notifications</span>
              {unread > 0 && (
                <button
                  className="topbar-dropdown-mark-btn"
                  onClick={markAllRead}
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="topbar-dropdown-scroll">
              {alerts.length === 0 ? (
                <div className="topbar-dropdown-empty">No notifications yet</div>
              ) : (
                alerts.slice(0, 6).map(a => (
                  <div
                    key={a.id}
                    className={`topbar-notif-item${!a.is_read ? " unread" : ""}`}
                  >
                    <span
                      className="topbar-notif-dot"
                      style={{ background: ALERT_DOT[a.type] ?? "var(--t4)" }}
                    />
                    <div className="topbar-notif-body">
                      <div className="topbar-notif-title">{a.title}</div>
                      <div className="topbar-notif-message">{a.message}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link
              href="/dashboard/alerts"
              className="topbar-dropdown-footer"
              onClick={() => setShowAlerts(false)}
            >
              View all notifications →
            </Link>
          </div>
        )}
      </div>

      {/* ── User menu ── */}
      <div ref={userRef} style={{ position: "relative" }}>
        <button
          className="topbar-user-btn"
          onClick={() => { setShowUser(o => !o); setShowAlerts(false); }}
          aria-expanded={showUser}
          aria-label="User menu"
        >
          <div className="topbar-avatar">{initials}</div>
          <div>
            <div className="topbar-user-name">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="topbar-user-role">{user?.role ?? "User"}</div>
          </div>
          <ChevronDown />
        </button>

        {showUser && (
          <div
            className="topbar-dropdown topbar-user-dropdown"
            style={{ width: 210 }}
          >
            <div className="topbar-user-dropdown-head">
              <div className="topbar-user-dropdown-name">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="topbar-user-dropdown-email">{user?.email}</div>
            </div>

            <Link
              href="/dashboard/settings"
              className="topbar-dropdown-item"
              onClick={() => setShowUser(false)}
            >
              Profile &amp; Settings
            </Link>

            <div className="d-divider" />

            <button
              className="topbar-dropdown-item danger"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}