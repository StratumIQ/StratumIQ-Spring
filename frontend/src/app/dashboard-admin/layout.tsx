"use client";

import "./admin.css";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Toaster } from "sonner";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import AdminTopBar from "@/components/admin/layout/AdminTopBar";
import QueryProvider from "@/components/dashboard/layout/QueryProvider";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { getToken, removeToken, setToken } from "@/lib/utils";
import { isAdminRole, getDashboardPath } from "@/lib/routing/dashboardRoutes";
import type { DashUser } from "@/types";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<DashUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const data = await authApi.profile();
        if (cancelled) return;
        const userData = data.user ?? data;
        const role = userData.role || "USER";

        if (!isAdminRole(role)) {
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
              if (!isAdminRole(role)) {
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
          } catch { /* fall through */ }
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
    return () => { cancelled = true; };
  }, [router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-skeleton" style={{ width: 48, height: 48, borderRadius: 12 }} />
        <p style={{ color: "#94a3b8", fontSize: 14 }}>Loading admin platform…</p>
      </div>
    );
  }

  return (
    <QueryProvider>
      <div className="admin-root">
        <Toaster position="top-right" richColors closeButton />
        {sidebarOpen && (
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <AdminSidebar
          collapsed={collapsed && !sidebarOpen}
          onToggle={() => setCollapsed((c) => !c)}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="admin-main">
          <AdminTopBar user={user} onMenuClick={() => setSidebarOpen(true)} />
          <main className="admin-content">{children}</main>
        </div>
      </div>
    </QueryProvider>
  );
}
