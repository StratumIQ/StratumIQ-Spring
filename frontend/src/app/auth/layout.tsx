/**
 * Auth Layout — StratumIQ
 * Minimal shell: no Header/Footer, no token check.
 * ConditionalShell already suppresses chrome for /auth/*.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}