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
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <button className="admin-btn admin-btn-ghost admin-menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={18} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <span className="admin-badge admin-badge-open">{user?.role ?? "ADMIN"}</span>
        <div style={{ textAlign: "right", minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis" }}>{user?.firstName} {user?.lastName}</div>
          <div style={{ fontSize: 11, color: "var(--a-t3)", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email}</div>
        </div>
      </div>
    </header>
  );
}
