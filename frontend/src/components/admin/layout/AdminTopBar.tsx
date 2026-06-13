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
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button className="admin-btn admin-btn-ghost" onClick={onMenuClick} aria-label="Open menu" style={{ display: "none" }} id="admin-menu-btn">
          <Menu size={18} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{title}</h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span className="admin-badge admin-badge-open">{user?.role ?? "ADMIN"}</span>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.firstName} {user?.lastName}</div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>{user?.email}</div>
        </div>
      </div>
    </header>
  );
}
