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
  X,
  ChevronLeft,
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
  onClose?: () => void;
};

export default function Sidebar({ collapsed, onToggleCollapse, onClose }: Props) {
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
        onClick={onClose}
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
      <div className="sb-logo-strip">
        <Link href="/dashboard" className="sb-logo-link" onClick={onClose}>
          <div className="sb-logo-icon">
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path
                d="M14 5C14 3.34 12.66 2 11 2H7C4.79 2 4.79 7 7 7H11C13.21 7 13.21 12 11 12H6"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          {!collapsed && (
            <div className="sb-logo-text">
              <b>
                Stratum<span>IQ</span>
              </b>
            </div>
          )}
        </Link>

        <div className="sb-logo-actions">
          {onClose && (
            <button className="sb-close-btn" onClick={onClose} aria-label="Close navigation">
              <X size={14} />
            </button>
          )}
          {!onClose && (
            <button
              className="sb-collapse-btn"
              onClick={onToggleCollapse}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          )}
        </div>
      </div>

      <nav className="sb-nav">
        <div className="sb-group">
          {!collapsed && <div className="sb-group-label">Workspace</div>}
          {NAV_ITEMS.map(renderItem)}
        </div>
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
