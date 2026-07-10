"use client";

import { Menu } from "lucide-react";
import type { DashUser } from "@/types";

type Props = {
  user: DashUser | null;
  onMenuClick: () => void;
  title?: string;
};

export default function AdminTopBar({ user, onMenuClick, title = "Admin Platform" }: Props) {
  return (
    <header className="admin-topbar">
      <button className="admin-topbar-icon-btn admin-topbar-menu-btn" onClick={onMenuClick} aria-label="Toggle navigation">
        <Menu size={18} />
      </button>

      <div className="admin-topbar-logo">
        <div className="admin-topbar-logo-icon">
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path
              d="M14 5C14 3.34 12.66 2 11 2H7C4.79 2 4.79 7 7 7H11C13.21 7 13.21 12 11 12H6"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span className="admin-topbar-logo-text">
          Stratum<span>IQ</span>
        </span>
        <span className="admin-topbar-logo-sub">ADMIN</span>
      </div>

      <div className="admin-topbar-title" style={{ marginLeft: 4, flex: 1 }}>
        {title}
      </div>

      <div className="admin-topbar-right">
        <span className="admin-topbar-badge admin-topbar-badge--admin">{user?.role ?? "ADMIN"}</span>
        <div style={{ textAlign: "right" }}>
          <div className="admin-topbar-user-name">{user?.firstName} {user?.lastName}</div>
          <div className="admin-topbar-user-email">{user?.email}</div>
        </div>
      </div>
    </header>
  );
}
