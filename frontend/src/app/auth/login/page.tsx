/**
 * /auth/login/page.tsx — StratumIQ
 * Redirects to unified auth page with login mode.
 * The auth page now lives at /auth and handles both login and signup in-place.
 */
import { redirect } from "next/navigation";

export default function LoginRedirect() {
  redirect("/auth?mode=login");
}