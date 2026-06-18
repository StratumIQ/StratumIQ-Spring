"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search, Menu, Bell, ChevronDown } from "lucide-react";
import { dashboardApi, normalizeAlerts } from "@/lib/api/dashboard";
import { authApi } from "@/lib/api/auth";
import { removeToken } from "@/lib/utils";
import type { DashUser } from "@/types";
import { ALERT_CONFIG } from "@/lib/constants";

type Props = {
  user: DashUser | null;
  onMenuClick: () => void;
};

export default function TopBar({ user, onMenuClick }: Props) {
  const [showAlerts, setShowAlerts] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const alertRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const { data: alerts = [], refetch: refetchAlerts } = useQuery({
    queryKey: ["dashboard", "alerts"],
    queryFn: async () => normalizeAlerts(await dashboardApi.alerts()),
  });

  const unread = alerts.filter((a) => !a.is_read).length;
  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (alertRef.current && !alertRef.current.contains(e.target as Node)) setShowAlerts(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUser(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    await dashboardApi.markAlertsRead();
    refetchAlerts();
  };

  const handleSignOut = () => {
    removeToken();
    authApi.logout().finally(() => {
      window.location.href = "/auth";
    });
  };

  return (
    <header className="topbar">
      <button className="topbar-menu-btn" onClick={onMenuClick} aria-label="Toggle navigation">
        <Menu size={18} />
      </button>

      <div className="topbar-search-wrap">
        <span className="topbar-search-icon">
          <Search size={14} />
        </span>
        <input
          className="topbar-search"
          placeholder="Search equipment, fleet, or alerts…"
          aria-label="Search dashboard"
        />
      </div>

      <div className="topbar-spacer" />

      <div className={`topbar-status ${unread > 0 ? "warn" : "ok"}`}>
        <span className="topbar-status-dot" />
        {unread > 0 ? `${unread} Alert${unread !== 1 ? "s" : ""}` : "All Clear"}
      </div>

      <div ref={alertRef} className="topbar-dropdown-wrap">
        <button
          className="topbar-icon-btn"
          onClick={() => {
            setShowAlerts((o) => !o);
            setShowUser(false);
          }}
          aria-label="Notifications"
          aria-expanded={showAlerts}
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="topbar-badge">{unread > 9 ? "9+" : unread}</span>
          )}
        </button>

        {showAlerts && (
          <div className="topbar-dropdown" style={{ width: 340 }}>
            <div className="topbar-dropdown-header">
              <span className="topbar-dropdown-title">Notifications</span>
              {unread > 0 && (
                <button className="topbar-dropdown-mark-btn" onClick={markAllRead}>
                  Mark all read
                </button>
              )}
            </div>
            <div className="topbar-dropdown-scroll">
              {alerts.length === 0 ? (
                <div className="topbar-dropdown-empty">No notifications yet</div>
              ) : (
                alerts.slice(0, 6).map((a) => (
                  <div
                    key={a.id}
                    className={`topbar-notif-item${!a.is_read ? " unread" : ""}`}
                  >
                    <span
                      className="topbar-notif-dot"
                      style={{ background: ALERT_CONFIG[a.type]?.color ?? "var(--t4)" }}
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
              View all notifications
            </Link>
          </div>
        )}
      </div>

      <div ref={userRef} className="topbar-dropdown-wrap">
        <button
          className="topbar-user-btn"
          onClick={() => {
            setShowUser((o) => !o);
            setShowAlerts(false);
          }}
          aria-expanded={showUser}
          aria-label="User menu"
        >
          <div className="topbar-avatar">{initials}</div>
          <div className="topbar-user-info">
            <div className="topbar-user-name">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="topbar-user-role">{user?.role ?? "User"}</div>
          </div>
          <ChevronDown size={12} />
        </button>

        {showUser && (
          <div className="topbar-dropdown topbar-user-dropdown" style={{ width: 220 }}>
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
            <button className="topbar-dropdown-item danger" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
