/**
 * Enterprise Session Management & Timeout Hook
 * Handles automatic token refresh, idle detection, and session expiry warnings
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./token";
import { SESSION } from "@/lib/constants";
import { authAPI } from "@/lib/utils";
import { useIdleSessionModal } from "@/hooks/useIdleSessionModal";

interface SessionState {
  lastActivityTime: number;
  isWarningShown: boolean;
  warningExpireTime: number | null;
  isAutoRefreshing: boolean;
}

/**
 * Session management hook
 * Must be used near the root of authenticated pages
 * Handles: token refresh, idle detection, warning modal, logout
 */
export function useSessionManagement() {
  const router = useRouter();
  const sessionStateRef = useRef<SessionState>({
    lastActivityTime: Date.now(),
    isWarningShown: false,
    warningExpireTime: null,
    isAutoRefreshing: false,
  });

  const { showModal, hideModal } = useIdleSessionModal();
  const lastActivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tokenRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const idleCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Activity Tracking ────────────────────────────────────────────────────
  /**
   * Track user activity and reset session timeout
   * Debounced to avoid excessive state updates
   */
  const recordActivity = useCallback(() => {
    const now = Date.now();
    const state = sessionStateRef.current;

    // Only update if enough time has passed (debounce)
    if (now - state.lastActivityTime < SESSION.ACTIVITY_DEBOUNCE_MS) {
      return;
    }

    state.lastActivityTime = now;

    // If warning was shown, hide it and extend session
    if (state.isWarningShown) {
      hideModal();
      state.isWarningShown = false;
    }

    // Clear any pending warning timeouts
    if (lastActivityTimeoutRef.current) {
      clearTimeout(lastActivityTimeoutRef.current);
    }

    // Set timeout for next warning
    lastActivityTimeoutRef.current = setTimeout(() => {
      const timeSinceLastActivity = Date.now() - state.lastActivityTime;
      if (timeSinceLastActivity >= SESSION.IDLE_TIMEOUT_MS) {
        showIdleWarning();
      }
    }, SESSION.IDLE_TIMEOUT_MS);
  }, []);

  // ─── Idle Warning Modal ────────────────────────────────────────────────────
  /**
   * Show idle session warning with countdown
   */
  const showIdleWarning = useCallback(() => {
    const state = sessionStateRef.current;
    if (state.isWarningShown) return;

    state.isWarningShown = true;
    const warningExpireTime = Date.now() + SESSION.WARNING_TIME_MS;
    state.warningExpireTime = warningExpireTime;

    showModal({
      timeRemaining: SESSION.WARNING_TIME_MS,
      onStayLoggedIn: async () => {
        state.isWarningShown = false;
        // Refresh tokens silently
        await refreshAccessToken(true);
        hideModal();
      },
      onLogout: () => {
        logout();
      },
    });

    // Auto-logout if user doesn't respond
    setTimeout(() => {
      if (state.isWarningShown) {
        logout();
      }
    }, SESSION.WARNING_TIME_MS);
  }, [showModal, hideModal]);

  // ─── Token Refresh ────────────────────────────────────────────────────────
  /**
   * Refresh access token silently (without disrupting user)
   * Called automatically when token is about to expire or via manual request
   */
  const refreshAccessToken = useCallback(
    async (force: boolean = false): Promise<boolean> => {
      const state = sessionStateRef.current;

      // Prevent concurrent refresh attempts
      if (state.isAutoRefreshing && !force) {
        return false;
      }

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        console.warn("[Session] No refresh token available");
        await logout();
        return false;
      }

      state.isAutoRefreshing = true;

      try {
        const response = await authAPI.refresh();

        if (response.access_token && response.refresh_token) {
          // Store new tokens
          setTokens(response.access_token, response.refresh_token);

          // Update session configuration if provided
          if (response.session_timeout_ms) {
            // Frontend can use this to adjust modal timeouts dynamically
            console.debug(
              "[Session] Updated timeout configuration",
              response.session_timeout_ms
            );
          }

          state.isAutoRefreshing = false;
          return true;
        }
      } catch (error) {
        console.error("[Session] Token refresh failed:", error);

        // If refresh fails, we need to logout
        await logout();
        return false;
      }

      state.isAutoRefreshing = false;
      return false;
    },
    []
  );

  // ─── Token Expiry Check ────────────────────────────────────────────────────
  /**
   * Check token expiry periodically and refresh before expiration
   */
  const checkAndRefreshToken = useCallback(async () => {
    const accessToken = getAccessToken();
    if (!accessToken) return;

    try {
      // Decode JWT without verification (client-side only for timing)
      const parts = accessToken.split(".");
      if (parts.length !== 3) return;

      const decoded = JSON.parse(
        Buffer.from(parts[1], "base64").toString("utf-8")
      );
      const expiryTime = (decoded.exp || 0) * 1000; // Convert to ms
      const timeUntilExpiry = expiryTime - Date.now();

      // Refresh if token expires in less than 5 minutes
      if (
        timeUntilExpiry > 0 &&
        timeUntilExpiry < SESSION.REFRESH_BEFORE_EXPIRY_MS
      ) {
        console.debug("[Session] Token expiring soon, refreshing...", {
          expiresIn: timeUntilExpiry / 1000,
        });
        await refreshAccessToken(true);
      }
    } catch (error) {
      console.debug("[Session] Could not decode token for expiry check");
    }
  }, [refreshAccessToken]);

  // ─── Lifecycle Initialization ──────────────────────────────────────────────
  /**
   * Setup activity tracking listeners and auto-refresh intervals on mount
   */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const state = sessionStateRef.current;
    state.lastActivityTime = Date.now();

    // Activity tracking listeners
    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "touchmove",
    ];

    const handleActivity = () => recordActivity();

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Token refresh check interval
    tokenRefreshIntervalRef.current = setInterval(() => {
      checkAndRefreshToken();
    }, SESSION.TOKEN_CHECK_INTERVAL_MS);

    // Initial idle warning timeout
    lastActivityTimeoutRef.current = setTimeout(() => {
      const timeSinceLastActivity = Date.now() - state.lastActivityTime;
      if (timeSinceLastActivity >= SESSION.IDLE_TIMEOUT_MS) {
        showIdleWarning();
      }
    }, SESSION.IDLE_TIMEOUT_MS);

    // Cleanup
    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });

      if (lastActivityTimeoutRef.current) {
        clearTimeout(lastActivityTimeoutRef.current);
      }

      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current);
      }

      if (idleCheckIntervalRef.current) {
        clearInterval(idleCheckIntervalRef.current);
      }
    };
  }, [recordActivity, checkAndRefreshToken, showIdleWarning]);

  // ─── Logout ────────────────────────────────────────────────────────────────
  /**
   * Clear session, tokens, and redirect to login
   */
  const logout = useCallback(async () => {
    // Clear all timers
    if (lastActivityTimeoutRef.current) {
      clearTimeout(lastActivityTimeoutRef.current);
    }
    if (tokenRefreshIntervalRef.current) {
      clearInterval(tokenRefreshIntervalRef.current);
    }
    if (idleCheckIntervalRef.current) {
      clearInterval(idleCheckIntervalRef.current);
    }

    // Hide modal
    hideModal();

    // Clear tokens
    clearTokens();

    // Redirect to login
    router.replace("/auth/login?reason=session_expired");
  }, [router, hideModal]);

  return {
    recordActivity,
    refreshAccessToken,
    logout,
  };
}
