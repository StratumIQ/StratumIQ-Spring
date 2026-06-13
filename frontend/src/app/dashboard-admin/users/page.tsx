"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { adminApi } from "@/services/admin/adminClient";
import type { PaginatedUsers } from "@/types/admin";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<PaginatedUsers>({
    queryKey: ["admin", "users", search, role, status, page],
    queryFn: () => adminApi.listUsers({ search, role, status, page, limit: 20 }) as Promise<PaginatedUsers>,
  });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>User Management</h2>
        <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 4 }}>Search, filter, and manage platform users</p>
      </div>

      <div className="admin-glass" style={{ padding: 16, marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: "#64748b" }} />
          <input
            className="admin-input"
            style={{ paddingLeft: 36 }}
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="admin-input" style={{ width: 140 }} value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
          <option value="all">All roles</option>
          <option value="USER">User</option>
          <option value="DEALER">Dealer</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select className="admin-input" style={{ width: 140 }} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="all">All status</option>
          <option value="ACTIVE">Active</option>
          <option value="BANNED">Banned</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>

      <div className="admin-glass admin-table-wrap">
        {isLoading ? (
          <div style={{ padding: 24 }}><div className="admin-skeleton" style={{ height: 200 }} /></div>
        ) : (data?.users ?? []).length === 0 ? (
          <div className="admin-empty">No users found</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data?.users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</td>
                  <td style={{ color: "#94a3b8" }}>{u.email}</td>
                  <td><span className="admin-badge admin-badge-open">{u.role}</span></td>
                  <td>
                    <span className={`admin-badge ${u.status === "ACTIVE" ? "admin-badge-active" : u.status === "BANNED" ? "admin-badge-banned" : "admin-badge-open"}`}>
                      {u.status}
                    </span>
                  </td>
                  <td style={{ color: "#94a3b8", fontSize: 12 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link href={`/dashboard-admin/users/${u.id}`} className="admin-btn admin-btn-ghost" style={{ textDecoration: "none", padding: "6px 12px" }}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data && data.pagination.totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
          <button className="admin-btn admin-btn-ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span style={{ padding: "8px 12px", color: "#94a3b8", fontSize: 13 }}>Page {page} of {data.pagination.totalPages}</span>
          <button className="admin-btn admin-btn-ghost" disabled={page >= data.pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
