/**
 * /auth/signup/page.tsx — StratumIQ
 * Redirects to unified auth page with register mode.
 */
import { redirect } from "next/navigation";

export default function SignupRedirect() {
  redirect("/auth?mode=register");
}