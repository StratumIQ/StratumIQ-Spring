"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/services/admin/adminClient";
import type { AdminTicket } from "@/types/admin";

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
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const noteMutation = useMutation({
    mutationFn: () => adminApi.addTicketNote(ticketId, { body: note, isInternal: true }),
    onSuccess: () => {
      toast.success("Note added");
      setNote("");
      qc.invalidateQueries({ queryKey: ["admin", "ticket", ticketId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading || !ticket) {
    return <div className="admin-glass" style={{ padding: 24 }}><div className="admin-skeleton" style={{ height: 200 }} /></div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <span style={{ fontFamily: "monospace", color: "#E8692C", fontSize: 13 }}>{ticket.ticketNumber}</span>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: "8px 0 4px" }}>{ticket.subject}</h2>
        <p style={{ color: "#94a3b8" }}>{ticket.customerName} · {ticket.customerEmail}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
        <div>
          <div className="admin-glass" style={{ padding: 20, marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Description</h3>
            <p style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.6 }}>{ticket.description || "No description provided."}</p>
          </div>

          <div className="admin-glass" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Internal Notes</h3>
            {(ticket.notes ?? []).length === 0 ? (
              <div className="admin-empty" style={{ padding: 16 }}>No notes yet</div>
            ) : (
              ticket.notes.map((n) => (
                <div key={n.id} style={{ padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{n.authorName} · {new Date(n.createdAt).toLocaleString()}</div>
                  <div style={{ fontSize: 13, marginTop: 6 }}>{n.body}</div>
                </div>
              ))
            )}
            <div style={{ marginTop: 16 }}>
              <textarea
                className="admin-input"
                rows={3}
                placeholder="Add internal note…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <button
                className="admin-btn admin-btn-primary"
                style={{ marginTop: 8 }}
                disabled={!note.trim() || noteMutation.isPending}
                onClick={() => noteMutation.mutate()}
              >
                Add Note
              </button>
            </div>
          </div>
        </div>

        <div className="admin-glass" style={{ padding: 20, height: "fit-content" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Actions</h3>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: "#64748b" }}>Current status</span>
            <div style={{ marginTop: 4 }}>{ticket.status}</div>
          </div>
          <select
            className="admin-input"
            style={{ marginBottom: 12 }}
            value={ticket.status}
            onChange={(e) => statusMutation.mutate(e.target.value)}
          >
            <option value="OPEN">OPEN</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="WAITING_CUSTOMER">WAITING_CUSTOMER</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>
          {ticket.assigneeName && (
            <div style={{ fontSize: 13, color: "#94a3b8" }}>Assigned to: {ticket.assigneeName}</div>
          )}
        </div>
      </div>
    </div>
  );
}
