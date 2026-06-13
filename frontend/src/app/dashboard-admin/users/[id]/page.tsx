"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/services/admin/adminClient";
import type { AdminUser } from "@/types/admin";

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);
  const qc = useQueryClient();

  const { data: user, isLoading } = useQuery<AdminUser>({
    queryKey: ["admin", "user", userId],
    queryFn: () => adminApi.getUser(userId) as Promise<AdminUser>,
    enabled: !!userId,
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => adminApi.updateUserStatus(userId, status),
    onSuccess: () => {
      toast.success("User status updated");
      qc.invalidateQueries({ queryKey: ["admin", "user", userId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const roleMutation = useMutation({
    mutationFn: (role: string) => adminApi.updateUserRole(userId, role),
    onSuccess: () => {
      toast.success("Role updated");
      qc.invalidateQueries({ queryKey: ["admin", "user", userId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resetMutation = useMutation({
    mutationFn: () => adminApi.resetPassword(userId) as Promise<{ temporaryPassword?: string; message?: string }>,
    onSuccess: (data: { temporaryPassword?: string; message?: string }) => {
      toast.success(data.message ?? "Password reset");
      if (data.temporaryPassword) {
        toast.info(`Temporary password: ${data.temporaryPassword}`, { duration: 15000 });
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading || !user) {
    return <div className="admin-glass" style={{ padding: 24 }}><div className="admin-skeleton" style={{ height: 200 }} /></div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{user.firstName} {user.lastName}</h2>
        <p style={{ color: "#94a3b8", fontSize: 14 }}>{user.email}</p>
      </div>

      <div className="admin-glass" style={{ padding: 24, maxWidth: 640 }}>
        <div style={{ display: "grid", gap: 16 }}>
          <div><span style={{ color: "#64748b", fontSize: 12 }}>Role</span><div>{user.role}</div></div>
          <div><span style={{ color: "#64748b", fontSize: 12 }}>Status</span><div>{user.status}</div></div>
          <div><span style={{ color: "#64748b", fontSize: 12 }}>Phone</span><div>{user.phone || "—"}</div></div>
          <div><span style={{ color: "#64748b", fontSize: 12 }}>Last login</span><div>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}</div></div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 24, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          {user.status === "ACTIVE" ? (
            <button className="admin-btn admin-btn-ghost" onClick={() => statusMutation.mutate("BANNED")} disabled={statusMutation.isPending}>
              Disable User
            </button>
          ) : (
            <button className="admin-btn admin-btn-primary" onClick={() => statusMutation.mutate("ACTIVE")} disabled={statusMutation.isPending}>
              Activate User
            </button>
          )}
          <select
            className="admin-input"
            style={{ width: 140 }}
            value={user.role}
            onChange={(e) => roleMutation.mutate(e.target.value)}
          >
            <option value="USER">USER</option>
            <option value="DEALER">DEALER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <button className="admin-btn admin-btn-ghost" onClick={() => resetMutation.mutate()} disabled={resetMutation.isPending}>
            Reset Password
          </button>
        </div>
      </div>
    </div>
  );
}
