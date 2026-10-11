"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Clock3, Download, ExternalLink, MessageSquareText, ShieldCheck, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/services/admin/adminClient";
import { resolveAssetUrl } from "@/lib/constants";
import type { AdminTicket } from "@/types/admin";

type ParsedAttachment = { name: string; url: string };

function parseAttachmentsFromText(raw?: string | null): { text: string; attachments: ParsedAttachment[] } {
  if (!raw) return { text: "", attachments: [] };
  const marker = /\n?Attachments:\n?/;
  const match = raw.match(marker);
  if (!match || match.index === undefined) return { text: raw, attachments: [] };

  const text = raw.slice(0, match.index).trim();
  const block = raw.slice(match.index + match[0].length);
  const attachments = Array.from(block.matchAll(/^-\s*(.+?):\s*(\S+)\s*$/gm)).map((m) => ({
    name: m[1].trim(),
    url: m[2].trim(),
  }));
  return { text, attachments };
}

async function forceDownload(href: string, name: string) {
  try {
    const res = await fetch(href);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(href, "_blank", "noopener,noreferrer");
  }
}

function AttachmentList({ attachments }: { attachments: ParsedAttachment[] }) {
  if (!attachments.length) return null;
  return (
    <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
      {attachments.map((attachment, idx) => {
        const href = resolveAssetUrl(attachment.url) ?? attachment.url;
        return (
          <div
            key={`${attachment.url}-${idx}`}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
              borderRadius: 10, border: "1px solid var(--a-border, rgba(255,255,255,0.1))",
              background: "var(--a-surface-2, rgba(255,255,255,0.03))",
            }}
          >
            <span style={{ fontSize: 12.5, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {attachment.name}
            </span>
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="admin-btn admin-btn-ghost"
              style={{ padding: "5px 10px", fontSize: 12 }}
            >
              <ExternalLink size={12} /> View
            </a>
            <button
              type="button"
              className="admin-btn admin-btn-ghost"
              style={{ padding: "5px 10px", fontSize: 12 }}
              onClick={() => forceDownload(href, attachment.name)}
            >
              <Download size={12} /> Download
            </button>
          </div>
        );
      })}
    </div>
  );
}

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
  const [internalOnly, setInternalOnly] = useState(false);

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
    mutationFn: () => adminApi.addTicketNote(ticketId, { body: note, isInternal: internalOnly }),
    onSuccess: () => {
      toast.success(internalOnly ? "Internal note added" : "Reply sent to customer");
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

  const { text: descriptionText, attachments: descriptionAttachments } = parseAttachmentsFromText(ticket.description);
  const parsedNotes = notes.map((noteItem) => ({
    ...noteItem,
    ...parseAttachmentsFromText(noteItem.body),
  }));
  const allAttachments = [...descriptionAttachments, ...parsedNotes.flatMap((n) => n.attachments)];

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
            <p style={{ margin: 0, color: "var(--a-t2)", lineHeight: 1.7 }}>{descriptionText || "No description provided."}</p>
            <AttachmentList attachments={descriptionAttachments} />
          </div>

          <div className="admin-glass" style={{ padding: 20 }}>
            <div className="admin-support-section-title">
              <ShieldCheck size={14} /> Replies
            </div>
            {parsedNotes.length === 0 ? (
              <div className="admin-empty" style={{ padding: 16 }}>No replies recorded yet.</div>
            ) : (
              <div className="admin-support-thread">
                {parsedNotes.map((noteItem) => (
                  <div key={noteItem.id} className="admin-support-thread-item">
                    <div className="admin-support-thread-meta">
                      <strong>{noteItem.authorName}</strong>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        {noteItem.isInternal && (
                          <span className="admin-badge admin-badge-pending" style={{ fontSize: 10 }}>Internal</span>
                        )}
                        {formatDate(noteItem.createdAt)}
                      </span>
                    </div>
                    {noteItem.text && <div>{noteItem.text}</div>}
                    <AttachmentList attachments={noteItem.attachments} />
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: 16 }}>
              <textarea
                className="admin-input"
                rows={3}
                placeholder={internalOnly ? "Add an internal note (only staff can see this)…" : "Reply to the customer…"}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, flexWrap: "wrap", gap: 8 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--a-t3)", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={internalOnly}
                    onChange={(e) => setInternalOnly(e.target.checked)}
                  />
                  Internal note only (not visible to customer)
                </label>
                <button
                  className="admin-btn admin-btn-primary"
                  disabled={!note.trim() || noteMutation.isPending}
                  onClick={() => noteMutation.mutate()}
                >
                  {noteMutation.isPending ? "Sending…" : internalOnly ? "Add internal note" : "Send reply"}
                </button>
              </div>
            </div>
          </div>

          <div className="admin-glass" style={{ padding: 20 }}>
            <div className="admin-support-section-title">
              <Clock3 size={14} /> Attachments
            </div>
            {allAttachments.length === 0 ? (
              <div className="admin-empty" style={{ padding: 16 }}>No attachments on this ticket.</div>
            ) : (
              <AttachmentList attachments={allAttachments} />
            )}
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
                <div>{parsedNotes[parsedNotes.length - 1]?.text || "No thread updates yet"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
