"use client";

/**
 * Dashboard Layout — StratumIQ
 * JWT-guards all /dashboard/* routes.
 * Fetches user profile from GET /dashboard/profile on mount.
 * Redirects to /auth on any auth failure.
 */

import "./dashboard.css"; // Import your new CSS

import { useState, useEffect, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import { API_URL } from "@/lib/constants";
import { getToken, removeToken, setToken } from "@/lib/utils";
import type { DashUser } from "@/types";

export type { DashUser };

const UserCtx = createContext<DashUser | null>(null);
export const useDashUser = () => useContext(UserCtx);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<DashUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) { 
      router.push("/auth"); 
      return;
    }

    let cancelled = false;
    
    fetch(`${API_URL}/dashboard/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) {
            // Try to refresh token
            const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
              credentials: "include",
            });
            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              if (refreshData.accessToken) {
                setToken(refreshData.accessToken);
                // Retry the profile fetch
                return fetch(`${API_URL}/dashboard/profile`, {
                  headers: { Authorization: `Bearer ${refreshData.accessToken}` },
                  credentials: "include",
                });
              }
            }
            throw new Error("Unauthorized");
          }
          throw new Error("Failed to fetch profile");
        }
        return res;
      })
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        if (data.error) {
          removeToken();
          router.push("/auth");
          return;
        }
        
        // Handle both response formats: { user: {...} } or just {...}
        const userData = data.user || data;
        
        setUser({
          id: userData.id,
          firstName: userData.firstName || userData.first_name || "",
          lastName: userData.lastName || userData.last_name || "",
          email: userData.email,
          role: userData.role || "USER",
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Auth error:", err);
        if (!cancelled) {
          removeToken();
          router.push("/auth");
        }
      });

    return () => { cancelled = true; };
  }, [router]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  if (loading) {
    return (
      <div className="dash-root" style={{
        display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh",
      }}>
        <div style={{ textAlign: "center" }}>
          <div className="sb-logo-icon" style={{ margin: "0 auto 16px", width: 48, height: 48 }}>
            <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
              <path d="M14 5C14 3.34 12.66 2 11 2H7C4.79 2 4.79 7 7 7H11C13.21 7 13.21 12 11 12H6"
                stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="d-btn-spinner dark" style={{ margin: "0 auto 10px" }} />
          <p className="d-text-muted" style={{ fontSize: 13.5, fontWeight: 500 }}>Loading workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <UserCtx.Provider value={user}>
      <div className="dash-root">

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="d-modal-overlay"
            style={{ position: "fixed", inset: 0, zIndex: 199, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)" }}
          />
        )}

        {/* Sidebar */}
        <div className={`dash-sidebar ${sidebarOpen ? "open" : ""}`} style={{ zIndex: 200 }}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main */}
        <div className="dash-main">
          <TopBar user={user} onMenuClick={() => setSidebarOpen(o => !o)} />
          <main className="anim-up">
            {children}
          </main>
        </div>
      </div>
    </UserCtx.Provider>
  );
}