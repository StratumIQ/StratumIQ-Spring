"use client";

import "./admin.css";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Toaster } from "sonner";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import AdminTopBar from "@/components/admin/layout/AdminTopBar";
import QueryProvider from "@/components/dashboard/layout/QueryProvider";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { removeToken } from "@/lib/utils";
import { isAdminRole, getDashboardPath } from "@/lib/routing/dashboardRoutes";
import type { DashUser } from "@/types";

function AdminSplashLoader() {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initializing admin platform...");

  useEffect(() => {
    const stages = [
      { at: 600,  pct: 30, text: "Verifying admin credentials..." },
      { at: 1300, pct: 58, text: "Loading platform data..." },
      { at: 2000, pct: 80, text: "Fetching tenant overview..." },
      { at: 2600, pct: 94, text: "Almost ready..." },
    ];
    const timers = stages.map(({ at, pct, text }) =>
      setTimeout(() => { setProgress(pct); setStatusText(text); }, at)
    );
    const kickoff = setTimeout(() => setProgress(18), 80);
    return () => { timers.forEach(clearTimeout); clearTimeout(kickoff); };
  }, []);

  return (
    <div className="admin-splash">
      <div className="admin-splash-ring-wrap">
        <svg className="admin-splash-rings" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
          <circle
            className="admin-splash-ring-outer"
            cx="100" cy="100" r="88" fill="none"
            stroke="#E8692C" strokeWidth="2" strokeLinecap="round"
            strokeDasharray="220 352"
          />
          <circle cx="100" cy="100" r="72" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
          <circle
            className="admin-splash-ring-inner"
            cx="100" cy="100" r="72" fill="none"
            stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeLinecap="round"
            strokeDasharray="120 332"
          />
          <circle className="admin-splash-dot" cx="100" cy="12" r="3" fill="#E8692C" />
          <circle className="admin-splash-dot admin-splash-dot--2" cx="188" cy="100" r="2.2" fill="rgba(255,255,255,0.5)" />
          <circle className="admin-splash-dot admin-splash-dot--3" cx="100" cy="188" r="2.5" fill="#E8692C" opacity="0.7" />
        </svg>
        <div className="admin-splash-logo-wrap">
          <Image src="/logo-icon.png" alt="StratumIQ" width={68} height={68} className="admin-splash-logo-img" priority />
        </div>
      </div>
      <div className="admin-splash-brand">
        <span className="admin-splash-wordmark">Stratum<span>IQ</span></span>
        <span className="admin-splash-tagline">Admin Platform</span>
      </div>
      <div className="admin-splash-progress-wrap">
        <div className="admin-splash-progress-track">
          <div className="admin-splash-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="admin-splash-progress-text">{statusText}</span>
      </div>
    </div>
  );
}

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
        setUser({ id: userData.id!, firstName: userData.firstName || "", lastName: userData.lastName || "", email: userData.email!, role });
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          try {
            const refreshData = await authApi.refresh();
            // Access token is now in httpOnly cookie; no need to store it
            const retry = await authApi.profile();
            const userData = retry.user ?? retry;
            const role = userData.role || "USER";
            if (!isAdminRole(role)) { router.replace(getDashboardPath(role)); return; }
            setUser({ id: userData.id!, firstName: userData.firstName || "", lastName: userData.lastName || "", email: userData.email!, role });
            setLoading(false);
            return;
          } catch { /* fall through */ }
        }
        removeToken();
        router.push("/auth");
      }
    }

    // Token is now in httpOnly cookie; call loadProfile which will handle auth check
    loadProfile();
    return () => { cancelled = true; };
  }, [router]);

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  if (loading) return <AdminSplashLoader />;

  return (
    <QueryProvider>
      <div className="admin-root">
        <Toaster position="top-right" richColors closeButton />
        {sidebarOpen && (
          <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />
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