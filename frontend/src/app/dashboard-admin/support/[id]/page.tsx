"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Clock3, MessageSquareText, ShieldCheck, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/services/admin/adminClient";
import type { AdminTicket } from "@/types/admin";

const STATUS_META: Record<string, { label: string; className: string }> = {
  OPEN: { label: "Open", className: "admin-badge-open" },
  ASSIGNED: { label: "Assigned", className: "admin-badge-open" },
  IN_PROGRESS: { label: "In progress", className: "admin-badge-active" },
  WAITING_CUSTOMER: { label: "Waiting customer", className: "admin-badge-banned" },
  RESOLVED: { label: "Resolved", className: "admin-badge-resolved" },
};

const PRIORITY_META: Record<string, { label: string; className: string }> = {
  LOW: { label: "Low", className: "admin-badge-resolved" },
  MEDIUM: { label: "Medium", className: "admin-badge-pending" },
  HIGH: { label: "High", className: "admin-badge-banned" },
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AdminSupportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const ticketId = Number(id);
  const qc = useQueryClient();
  const [note, setNote] = useState("");

  const { data: ticket, isLoading } = useQuery<AdminTicket>({
    queryKey: ["admin", "ticket", ticketId],
    queryFn: () => adminApi.getTicket(ticketId) as Promise<AdminTicket>,
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => adminApi.updateTicketStatus(ticketId, status),
    onSuccess: () => {
      toast.success("Status updated");
      qc.invalidateQueries({ queryKey: ["admin", "ticket", ticketId] });
      qc.invalidateQueries({ queryKey: ["admin", "tickets"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const assignMutation = useMutation({
    mutationFn: () => adminApi.assignTicket(ticketId, ticketId),
    onSuccess: () => {
      toast.success("Ticket assigned");
      qc.invalidateQueries({ queryKey: ["admin", "ticket", ticketId] });
      qc.invalidateQueries({ queryKey: ["admin", "tickets"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const noteMutation = useMutation({
    mutationFn: () => adminApi.addTicketNote(ticketId, { body: note, isInternal: true }),
    onSuccess: () => {
      toast.success("Note added");
      setNote("");
      qc.invalidateQueries({ queryKey: ["admin", "ticket", ticketId] });
      qc.invalidateQueries({ queryKey: ["admin", "tickets"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading || !ticket) {
    return <div className="admin-glass" style={{ padding: 24 }}><div className="admin-skeleton" style={{ height: 240 }} /></div>;
  }

  const statusMeta = STATUS_META[ticket.status] ?? STATUS_META.OPEN;
  const priorityMeta = PRIORITY_META[ticket.priority] ?? PRIORITY_META.MEDIUM;
  const notes = ticket.notes ?? [];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Link href="/dashboard-admin/support" className="admin-btn admin-btn-ghost" style={{ textDecoration: "none", marginBottom: 12 }}>
          <ArrowLeft size={14} /> Back to queue
        </Link>
        <div className="admin-glass" style={{ padding: 20 }}>
          <div className="admin-support-card-top" style={{ alignItems: "flex-start" }}>
            <div>
              <div className="admin-support-ticket-number">{ticket.ticketNumber}</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: "6px 0 4px" }}>{ticket.subject}</h2>
              <p style={{ margin: 0, color: "var(--a-t3)" }}>
                {ticket.customerName || ticket.customerEmail || "Unknown customer"}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span className={`admin-badge ${statusMeta.className}`}>{statusMeta.label}</span>
              <span className={`admin-badge ${priorityMeta.className}`}>{priorityMeta.label}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-support-grid">
        <div style={{ display: "grid", gap: 16 }}>
          <div className="admin-glass" style={{ padding: 20 }}>
            <div className="admin-support-section-title">
              <MessageSquareText size={14} /> Conversation
            </div>
            <p style={{ margin: 0, color: "var(--a-t2)", lineHeight: 1.7 }}>{ticket.description || "No description provided."}</p>
          </div>

          <div className="admin-glass" style={{ padding: 20 }}>
            <div className="admin-support-section-title">
              <ShieldCheck size={14} /> Replies
            </div>
            {notes.length === 0 ? (
              <div className="admin-empty" style={{ padding: 16 }}>No replies recorded yet.</div>
            ) : (
              <div className="admin-support-thread">
                {notes.map((noteItem) => (
                  <div key={noteItem.id} className="admin-support-thread-item">
                    <div className="admin-support-thread-meta">
                      <strong>{noteItem.authorName}</strong>
                      <span>{formatDate(noteItem.createdAt)}</span>
                    </div>
                    <div>{noteItem.body}</div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: 16 }}>
              <textarea
                className="admin-input"
                rows={3}
                placeholder="Add an internal note or next step…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <button
                className="admin-btn admin-btn-primary"
                style={{ marginTop: 8 }}
                disabled={!note.trim() || noteMutation.isPending}
                onClick={() => noteMutation.mutate()}
              >
                Add note
              </button>
            </div>
          </div>

          <div className="admin-glass" style={{ padding: 20 }}>
            <div className="admin-support-section-title">
              <Clock3 size={14} /> Attachments
            </div>
            <div className="admin-empty" style={{ padding: 16 }}>Attachments will appear here when the upload flow is enabled.</div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <div className="admin-glass" style={{ padding: 20 }}>
            <div className="admin-support-section-title">
              <UserCheck size={14} /> Ticket info
            </div>
            <div className="admin-support-side-card">
              <div>
                <div className="admin-support-label">Status</div>
                <select className="admin-input" value={ticket.status} onChange={(e) => statusMutation.mutate(e.target.value)}>
                  <option value="OPEN">Open</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_PROGRESS">In progress</option>
                  <option value="WAITING_CUSTOMER">Waiting customer</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>
              <div>
                <div className="admin-support-label">Priority</div>
                <div>{priorityMeta.label}</div>
              </div>
              <div>
                <div className="admin-support-label">Customer</div>
                <div>{ticket.customerName || ticket.customerEmail || "Unknown customer"}</div>
              </div>
              <div>
                <div className="admin-support-label">Assigned</div>
                <div>{ticket.assigneeName || "Unassigned"}</div>
              </div>
              <div>
                <div className="admin-support-label">Created</div>
                <div>{formatDate(ticket.createdAt)}</div>
              </div>
              <div>
                <div className="admin-support-label">Updated</div>
                <div>{formatDate(ticket.updatedAt)}</div>
              </div>
            </div>
            <div className="admin-support-row-actions" style={{ marginTop: 12 }}>
              <button className="admin-btn admin-btn-ghost" onClick={() => assignMutation.mutate()} disabled={assignMutation.isPending}>Assign</button>
              <button className="admin-btn admin-btn-primary" onClick={() => statusMutation.mutate("RESOLVED")} disabled={statusMutation.isPending}>Resolve</button>
              <button className="admin-btn admin-btn-ghost" onClick={() => statusMutation.mutate("RESOLVED")} disabled={statusMutation.isPending}>Close</button>
            </div>
          </div>

          <div className="admin-glass" style={{ padding: 20 }}>
            <div className="admin-support-section-title">
              <CheckCircle2 size={14} /> Activity
            </div>
            <div className="admin-support-side-card">
              <div>
                <div className="admin-support-label">Workflow</div>
                <div>{ticket.status}</div>
              </div>
              <div>
                <div className="admin-support-label">Latest update</div>
                <div>{notes[0]?.body || "No thread updates yet"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
