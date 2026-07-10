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
  Menu,
  Building2,
  Megaphone,
} from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { removeToken } from "@/lib/utils";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Executive", href: "/dashboard-admin", icon: LayoutDashboard, exact: true },
  { label: "Users", href: "/dashboard-admin/users", icon: Users },
  { label: "Fleet", href: "/dashboard-admin/fleet", icon: Truck },
  { label: "Activity", href: "/dashboard-admin/activity", icon: Activity },
  { label: "Marketing", href: "/dashboard-admin/marketing", icon: Megaphone },
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
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

export default function AdminSidebar({ collapsed, onToggle, open, onClose, onMouseEnter, onMouseLeave }: Props) {
  const pathname = usePathname() ?? "";
  const router = useRouter();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const logout = () => {
    removeToken();
    authApi.logout().finally(() => router.push("/auth"));
  };

  return (
    <aside
      className={cn("admin-sidebar", collapsed && "collapsed", open && "open")}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={cn("admin-toggle-row", collapsed && "admin-toggle-row--collapsed")}>
        <button
          className="admin-logo-collapse-btn"
          onClick={onClose ?? onToggle}
          aria-label={onClose ? "Close navigation" : collapsed ? "Expand menu" : "Collapse menu"}
          title={onClose ? undefined : collapsed ? "Expand menu" : "Collapse menu"}
        >
          <Menu size={16} />
        </button>
        {!collapsed && <span className="admin-toggle-label">Platform</span>}
      </div>

      <nav className="admin-nav">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              "admin-nav-item",
              isActive(item.href, item.exact) && "active",
              collapsed && "admin-nav-item--collapsed"
            )}
            title={collapsed ? item.label : undefined}
          >
            <span className="admin-nav-item-icon"><item.icon size={18} /></span>
            {!collapsed && item.label}
          </Link>
        ))}

        {!collapsed && <div className="admin-nav-label">COMING SOON</div>}
        {PHASE2.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              "admin-nav-item",
              isActive(item.href) && "active",
              collapsed && "admin-nav-item--collapsed"
            )}
            style={{ opacity: 0.6 }}
            title={collapsed ? item.label : undefined}
          >
            <span className="admin-nav-item-icon"><item.icon size={18} /></span>
            {!collapsed && item.label}
          </Link>
        ))}
      </nav>

      <div className="admin-sidebar-bottom">
        <button
          className={cn("admin-nav-item", collapsed && "admin-nav-item--collapsed")}
          onClick={logout}
          style={{ width: "100%", border: "none", background: "none", cursor: "pointer" }}
          title={collapsed ? "Sign out" : undefined}
        >
          <span className="admin-nav-item-icon"><LogOut size={18} /></span>
          {!collapsed && "Sign out"}
        </button>
      </div>
    </aside>
  );
}
