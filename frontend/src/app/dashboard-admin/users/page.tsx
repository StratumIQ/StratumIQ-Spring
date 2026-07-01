"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, UserPlus, X, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/services/admin/adminClient";
import type { PaginatedUsers, CreateUserResponse } from "@/types";

// ─── Create User Modal ────────────────────────────────────────────────────────

function CreateUserModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm]             = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [errors, setErrors]         = useState<Record<string, string>>({});
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const [copied, setCopied]         = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim())  e.lastName  = "Last name is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Valid email is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const mutation = useMutation({
    mutationFn: () =>
      adminApi.createUser({
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim(),
        email:     form.email.trim(),
        phone:     form.phone.trim() || undefined,
      }) as Promise<CreateUserResponse>,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      setCreatedPassword(data.defaultPassword);
      toast.success("User created successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleCopy = () => {
    if (!createdPassword) return;
    navigator.clipboard.writeText(createdPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="admin-modal-backdrop">
      <div className="admin-modal-card">
        {/* Header */}
        <div className="admin-modal-header">
          <div>
            <h3 className="admin-modal-title">Add User</h3>
            <p className="admin-modal-subtitle">
              Default password: <code style={{ color: "var(--a-t1)" }}>LastName@{new Date().getFullYear()}1234</code>
            </p>
          </div>
          <button className="admin-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* ── Success: show generated password ── */}
        {createdPassword ? (
          <div>
            <div className="admin-success-banner">
              <p className="admin-success-title">
                User created — share this password securely with the user
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <code className="admin-password-pill">
                  {createdPassword}
                </code>
                <button onClick={handleCopy} style={{
                  background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8, padding: "9px 12px", cursor: "pointer", color: "#e2e8f0",
                  display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600,
                  whiteSpace: "nowrap",
                }}>
                  {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <p style={{ fontSize: 11, color: "#64748b", marginTop: 8 }}>
                Ask the user to change their password on first login.
              </p>
            </div>
            <button className="admin-btn admin-btn-primary" style={{ width: "100%" }} onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          /* ── Form ── */
          <div className="admin-page-shell">
            <div className="admin-form-grid">
              <div className="admin-form-field">
                <label className="admin-form-label">
                  First Name
                </label>
                <input
                  className="admin-input"
                  style={{ borderColor: errors.firstName ? "#ef4444" : undefined }}
                  placeholder="Ramesh"
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                />
                {errors.firstName && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{errors.firstName}</p>}
              </div>
              <div className="admin-form-field">
                <label className="admin-form-label">
                  Last Name
                </label>
                <input
                  className="admin-input"
                  style={{ borderColor: errors.lastName ? "#ef4444" : undefined }}
                  placeholder="Kumar"
                  value={form.lastName}
                  onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                />
                {errors.lastName && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{errors.lastName}</p>}
              </div>
            </div>

            <div className="admin-form-field">
              <label className="admin-form-label">
                Email <span style={{ color: "#475569", fontWeight: 400, textTransform: "none" }}>(used as username)</span>
              </label>
              <input
                className="admin-input"
                style={{ borderColor: errors.email ? "#ef4444" : undefined }}
                type="email"
                placeholder="ramesh@company.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
              {errors.email && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{errors.email}</p>}
            </div>

            <div className="admin-form-field">
              <label className="admin-form-label">
                Phone <span style={{ color: "#475569", fontWeight: 400, textTransform: "none" }}>(optional)</span>
              </label>
              <input
                className="admin-input"
                type="tel"
                placeholder="9876543210"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>

            <div className="admin-form-actions">
              <button className="admin-btn admin-btn-ghost" style={{ flex: 1 }} onClick={onClose} disabled={mutation.isPending}>
                Cancel
              </button>
              <button
                className="admin-btn admin-btn-primary"
                style={{ flex: 2 }}
                onClick={() => validate() && mutation.mutate()}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Creating…" : "Create User"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [search, setSearch]         = useState("");
  const [role, setRole]             = useState("all");
  const [status, setStatus]         = useState("all");
  const [page, setPage]             = useState(1);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useQuery<PaginatedUsers>({
    queryKey: ["admin", "users", search, role, status, page],
    queryFn:  () => adminApi.listUsers({ search, role, status, page, limit: 20 }) as Promise<PaginatedUsers>,
  });

  return (
    <div>
      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} />}

      {/* Header */}
      <div className="admin-panel-header" style={{ marginBottom: 24 }}>
        <div>
          <h2 className="admin-page-title">User Management</h2>
          <p className="admin-page-sub">Search, filter, and manage platform users</p>
        </div>
        <button
          className="admin-btn admin-btn-primary"
          style={{ display: "flex", alignItems: "center", gap: 7 }}
          onClick={() => setShowCreate(true)}
        >
          <UserPlus size={15} />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="admin-glass admin-toolbar" style={{ marginBottom: 16 }}>
        <div className="admin-toolbar-field" style={{ position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: "#64748b" }} />
          <input
            className="admin-input"
            style={{ paddingLeft: 36 }}
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="admin-input admin-toolbar-field--compact" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
          <option value="all">All roles</option>
          <option value="USER">User</option>
          <option value="DEALER">Dealer</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select className="admin-input admin-toolbar-field--compact" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="all">All status</option>
          <option value="ACTIVE">Active</option>
          <option value="BANNED">Banned</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>

      {/* Table */}
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
                    <span className={`admin-badge ${
                      u.status === "ACTIVE"  ? "admin-badge-active" :
                      u.status === "BANNED"  ? "admin-badge-banned" :
                      "admin-badge-open"
                    }`}>
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

      {/* Pagination */}
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