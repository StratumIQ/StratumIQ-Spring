export type AppRole = "USER" | "DEALER" | "ADMIN" | "SUPER_ADMIN";

export function getDashboardPath(role: string): string {
  switch (role?.toUpperCase()) {
    case "ADMIN":
    case "SUPER_ADMIN":
      return "/dashboard-admin";
    case "DEALER":
    case "USER":
    default:
      return "/dashboard";
  }
}

export function isAdminRole(role: string | undefined | null): boolean {
  const r = role?.toUpperCase();
  return r === "ADMIN" || r === "SUPER_ADMIN";
}
