"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Truck,
  Wrench,
  Bell,
  Package,
  Settings2,
  SlidersHorizontal,
  BarChart3,
  LogOut,
  Menu,
  ChevronRight,
  Cpu,
  Headset,
} from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { removeToken } from "@/lib/utils";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  exact?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={16} />, exact: true },
  { label: "Fleet", href: "/dashboard/fleet", icon: <Truck size={16} /> },
  { label: "Equipment", href: "/dashboard/equipment", icon: <Cpu size={16} /> },
  { label: "Maintenance", href: "/dashboard/maintenance", icon: <Wrench size={16} /> },
  { label: "Alerts", href: "/dashboard/alerts", icon: <Bell size={16} /> },
  { label: "Support", href: "/dashboard/support", icon: <Headset size={16} /> },
  { label: "Parts", href: "/dashboard/parts", icon: <Package size={16} /> },
  { label: "Configurator", href: "/dashboard/configurator", icon: <SlidersHorizontal size={16} /> },
  { label: "Solutions", href: "/dashboard/solutions", icon: <BarChart3 size={16} /> },
];

const BOTTOM_ITEMS: NavItem[] = [
  { label: "Settings", href: "/dashboard/settings", icon: <Settings2 size={16} /> },
];

type Props = {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate?: () => void;
  onClose?: () => void;
};

export default function Sidebar({ collapsed, onToggleCollapse, onNavigate, onClose }: Props) {
  const pathname = usePathname() ?? "";
  const router = useRouter();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const handleLogout = () => {
    removeToken();
    authApi.logout().finally(() => router.push("/auth"));
  };

  const renderItem = (item: NavItem) => {
    const active = isActive(item.href, item.exact);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => {
          onClose?.();
          onNavigate?.();
        }}
        className={cn("sb-item", active && "active", collapsed && "sb-item--collapsed")}
        aria-current={active ? "page" : undefined}
        title={collapsed ? item.label : undefined}
      >
        <span className="sb-item-inner">
          <span className="sb-item-icon">{item.icon}</span>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                className="sb-item-label"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        {!collapsed && active && <ChevronRight size={12} className="sb-item-arrow" />}
      </Link>
    );
  };

  return (
    <aside className={cn("sb", collapsed && "sb--collapsed")} aria-label="Dashboard navigation">
      <div className={cn("sb-toggle-row", collapsed && "sb-toggle-row--collapsed")}>
        <button
          className="sb-close-btn"
          onClick={onClose ?? onToggleCollapse}
          aria-label={onClose ? "Close navigation" : collapsed ? "Expand menu" : "Collapse menu"}
          title={onClose ? undefined : collapsed ? "Expand menu" : "Collapse menu"}
        >
          <Menu size={16} />
        </button>
        {!collapsed && <span className="sb-toggle-label">Workspace</span>}
      </div>

      <nav className="sb-nav">
        <div className="sb-group">{NAV_ITEMS.map(renderItem)}</div>
      </nav>

      <div className="sb-bottom">
        {BOTTOM_ITEMS.map(renderItem)}
        <button
          className={cn("sb-logout-btn", collapsed && "sb-item--collapsed")}
          onClick={handleLogout}
          title={collapsed ? "Sign out" : undefined}
        >
          <span className="sb-item-icon">
            <LogOut size={16} />
          </span>
          {!collapsed && <span>Sign out</span>}
        </button>
        {!collapsed && (
          <div className="sb-footer">
            <div className="sb-footer-title">StratumIQ Platform</div>
            <div className="sb-footer-sub">Enterprise · v1.0</div>
          </div>
        )}
      </div>
    </aside>
  );
}
