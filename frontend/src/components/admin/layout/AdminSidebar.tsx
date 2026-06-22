"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Activity,
  Truck,
  Headphones,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Building2,
} from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { removeToken } from "@/lib/utils";

const NAV = [
  { label: "Executive", href: "/dashboard-admin", icon: LayoutDashboard, exact: true },
  { label: "Users", href: "/dashboard-admin/users", icon: Users },
  { label: "Fleet", href: "/dashboard-admin/fleet", icon: Truck },
  { label: "Activity", href: "/dashboard-admin/activity", icon: Activity },
  { label: "Support", href: "/dashboard-admin/support", icon: Headphones },
];

const PHASE2 = [
  { label: "Companies", href: "/dashboard-admin/companies", icon: Building2 },
];

type Props = {
  collapsed: boolean;
  onToggle: () => void;
  open?: boolean;
  onClose?: () => void;
};

export default function AdminSidebar({ collapsed, onToggle, open, onClose }: Props) {
  const pathname = usePathname() ?? "";
  const router = useRouter();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const logout = () => {
    removeToken();
    authApi.logout().finally(() => router.push("/auth"));
  };

  return (
    <aside className={`admin-sidebar${collapsed ? " collapsed" : ""}${open ? " open" : ""}`}>
      <div style={{ padding: "20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {!collapsed && (
          <Link href="/dashboard-admin" onClick={onClose} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>
              Stratum<span style={{ color: "#E8692C" }}>IQ</span>
              <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, letterSpacing: "0.1em" }}>ADMIN</div>
            </div>
          </Link>
        )}
        {onClose ? (
          <button className="admin-btn admin-btn-ghost" onClick={onClose} aria-label="Close menu">
            <X size={16} />
          </button>
        ) : (
          <button className="admin-btn admin-btn-ghost" onClick={onToggle} aria-label="Toggle sidebar">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      <nav style={{ flex: 1, paddingTop: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", padding: "8px 20px", letterSpacing: "0.08em" }}>
          {!collapsed && "PLATFORM"}
        </div>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`admin-nav-item${isActive(item.href, item.exact) ? " active" : ""}`}
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={18} />
            {!collapsed && item.label}
          </Link>
        ))}

        <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", padding: "16px 20px 8px", letterSpacing: "0.08em" }}>
          {!collapsed && "COMING SOON"}
        </div>
        {PHASE2.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`admin-nav-item${isActive(item.href) ? " active" : ""}`}
            style={{ opacity: 0.6 }}
          >
            <item.icon size={18} />
            {!collapsed && item.label}
          </Link>
        ))}
      </nav>

      <div style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <button className="admin-nav-item" onClick={logout} style={{ width: "100%", border: "none", background: "none", cursor: "pointer" }}>
          <LogOut size={18} />
          {!collapsed && "Sign out"}
        </button>
      </div>
    </aside>
  );
}
