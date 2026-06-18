"use client";

import "./dashboard.css";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "@/components/dashboard/layout/Sidebar";
import TopBar from "@/components/dashboard/layout/TopBar";
import QueryProvider from "@/components/dashboard/layout/QueryProvider";
import DashboardToaster from "@/components/dashboard/layout/DashboardToaster";
import { UserCtx, SidebarCtx } from "@/components/dashboard/layout/DashboardContext";
import { authApi } from "@/lib/api/auth";
import DashboardLoader from "@/components/dashboard/layout/DashboardLoader";
import { ApiError } from "@/lib/api/client";
import { getToken, removeToken, setToken } from "@/lib/utils";
import { getDashboardPath, isAdminRole } from "@/lib/routing/dashboardRoutes";
import type { DashUser } from "@/types";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<DashUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("dash-sidebar-collapsed");
    if (stored === "true") setCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem("dash-sidebar-collapsed", String(next));
      return next;
    });
  };

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const data = await authApi.profile();
        if (cancelled) return;

        const userData = data.user ?? data;
        const role = userData.role || "USER";

        if (isAdminRole(role)) {
          router.replace(getDashboardPath(role));
          return;
        }

        setUser({
          id: userData.id!,
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email!,
          role,
        });
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          try {
            const refreshData = await authApi.refresh();
            if (refreshData.accessToken) {
              setToken(refreshData.accessToken);
              const retry = await authApi.profile();
              const userData = retry.user ?? retry;
              const role = userData.role || "USER";
              if (isAdminRole(role)) {
                router.replace(getDashboardPath(role));
                return;
              }
              setUser({
                id: userData.id!,
                firstName: userData.firstName || "",
                lastName: userData.lastName || "",
                email: userData.email!,
                role,
              });
              setLoading(false);
              return;
            }
          } catch {
            /* fall through */
          }
        }
        removeToken();
        router.push("/auth");
      }
    }

    const token = getToken();
    if (!token) {
      router.push("/auth");
      return;
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  if (loading) {
    return <DashboardLoader />;
  }

  return (
    <QueryProvider>
      <DashboardToaster />
      <UserCtx.Provider value={user}>
        <SidebarCtx.Provider value={{ collapsed, toggle: toggleCollapse }}>
          <div className={`dash-root${collapsed ? " dash-root--collapsed" : ""}`}>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  className="d-modal-overlay dash-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSidebarOpen(false)}
                  aria-hidden
                />
              )}
            </AnimatePresence>

            <div className={`dash-sidebar${sidebarOpen ? " open" : ""}`}>
              <Sidebar
                collapsed={collapsed && !sidebarOpen}
                onToggleCollapse={toggleCollapse}
                onClose={sidebarOpen ? () => setSidebarOpen(false) : undefined}
              />
            </div>

            <div className="dash-main">
              <TopBar user={user} onMenuClick={() => setSidebarOpen((o) => !o)} />
              <main>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {children}
                  </motion.div>
                </AnimatePresence>
              </main>
            </div>
          </div>
        </SidebarCtx.Provider>
      </UserCtx.Provider>
    </QueryProvider>
  );
}