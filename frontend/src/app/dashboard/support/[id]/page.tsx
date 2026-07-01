"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Clock3, FileImage, Headphones, MessageSquareText, Paperclip, Send, Sparkles, Ticket, Bug, Wrench, HelpCircle, ShieldAlert, Settings } from "lucide-react";
import { toast } from "sonner";
import PageShell from "@/components/dashboard/layout/PageShell";
import GlassCard from "@/components/dashboard/ui/GlassCard";
import Button from "@/components/dashboard/ui/Button";
import Badge from "@/components/dashboard/ui/Badge";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import Skeleton from "@/components/dashboard/ui/Skeleton";
import { ApiError, dashApi } from "@/lib/api/client";

type SupportTicket = {
  id: number;
  ticketNumber: string;
  type: "TICKET" | "FEEDBACK";
  subject: string;
  description: string | null;
  status: "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "WAITING_CUSTOMER" | "RESOLVED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  createdAt: string;
  notes?: Array<{
    id: number;
    body: string;
    isInternal: boolean;
    createdAt: string;
  }>;
};

type UploadedAttachment = {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
};

type ReplyPayload = {
  body: string;
};

const statusConfig: Record<SupportTicket["status"], { label: string; variant: "default" | "warning" | "success" | "danger" | "info" | "orange" }> = {
  OPEN: { label: "Open", variant: "warning" },
  ASSIGNED: { label: "Assigned", variant: "info" },
  IN_PROGRESS: { label: "In progress", variant: "orange" },
  WAITING_CUSTOMER: { label: "Waiting customer", variant: "default" },
  RESOLVED: { label: "Resolved", variant: "success" },
};

const priorityConfig: Record<SupportTicket["priority"], { label: string; variant: "default" | "warning" | "success" | "danger" | "info" | "orange" }> = {
  LOW: { label: "Low", variant: "default" },
  MEDIUM: { label: "Medium", variant: "warning" },
  HIGH: { label: "High", variant: "danger" },
};

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function buildBodyWithAttachments(body: string, attachments: UploadedAttachment[]) {
  if (!attachments.length) return body.trim();
  const lines = [body.trim(), "", "Attachments:"];
  attachments.forEach(({ name, url }) => { lines.push(`- ${name}: ${url}`); });
  return lines.join("\n");
}

export default function SupportTicketDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const ticketId = Number(params.id);

  const [reply, setReply] = useState("");
  const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);
  const [uploading, setUploading] = useState(false);

  const {
    data: ticket,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["dashboard", "support", "ticket", ticketId],
    queryFn: () => dashApi<SupportTicket>(`/support/tickets/${ticketId}`),
    enabled: Number.isFinite(ticketId),
    retry: false,
  });

  const addReplyMutation = useMutation({
    mutationFn: (payload: ReplyPayload) =>
      dashApi<SupportTicket>(`/support/tickets/${ticketId}/notes`, {
        method: "POST",
        body: payload,
      }),
    onSuccess: () => {
      toast.success("Reply sent");
      setReply("");
      setAttachments([]);
      queryClient.invalidateQueries({ queryKey: ["dashboard", "support", "tickets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "support", "ticket", ticketId] });
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "We couldn’t send that reply";
      toast.error(message);
    },
  });

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    setUploading(true);
    try {
      const uploaded: UploadedAttachment[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("/api/upload", { method: "POST", body: formData });
        const payload = await response.json();
        if (!response.ok || !payload?.url) {
          throw new Error(payload?.error || "Upload failed");
        }
        uploaded.push({
          id: `${file.name}-${Date.now()}`,
          name: file.name,
          url: payload.url,
          size: file.size,
          type: file.type,
        });
      }
      setAttachments((current) => [...current, ...uploaded]);
      toast.success(`${uploaded.length} attachment${uploaded.length > 1 ? "s" : ""} ready`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleReply = () => {
    if (!reply.trim() || !ticketId) return;
    addReplyMutation.mutate({ body: buildBodyWithAttachments(reply.trim(), attachments) });
  };

  const timelineEntries = useMemo(() => (ticket?.notes ?? []).slice().reverse(), [ticket]);

  return (
    <PageShell
      title="Support thread"
      description="A richer view of the conversation, with attachments and clearer status context."
      actions={
        <Button variant="outline" size="sm" icon={<ArrowLeft size={14} />} onClick={() => router.push("/dashboard/support")}>
          Back to support
        </Button>
      }
    >
      {isLoading ? (
        <div style={{ display: "grid", gap: 16 }}>
          <GlassCard padding="lg">
            <Skeleton height={22} width="55%" />
            <Skeleton height={13} width="80%" className="d-mt-2" />
            <Skeleton height={13} width="40%" className="d-mt-2" />
          </GlassCard>
          <GlassCard padding="lg">
            <Skeleton height={48} />
            <Skeleton height={48} className="d-mt-2" />
          </GlassCard>
        </div>
      ) : isError || !ticket ? (
        <EmptyState icon={Ticket} title="Ticket not found" description="That request no longer appears to be available." action={{ label: "Return to support", href: "/dashboard/support" }} />
      ) : (
        <div style={{ display: "grid", gap: 18 }}>
          <GlassCard padding="lg">
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 14, alignItems: "flex-start" }}>
              <div style={{ maxWidth: 680 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 999, background: "rgba(232,105,44,0.10)", color: "#E8692C", fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  {(() => {
                    const issueType = (ticket as any).issueType as string | undefined;
                    const key = (issueType || ticket.type || "").toString().toLowerCase();
                    if (key.includes("bug")) return <Bug size={14} />;
                    if (key.includes("feature")) return <Sparkles size={14} />;
                    if (key.includes("question") || key.includes("help")) return <HelpCircle size={14} />;
                    if (key.includes("equipment") || key.includes("equipment_issue") || key.includes("asset")) return <Settings size={14} />;
                    if (key.includes("maintenance")) return <Wrench size={14} />;
                    if (key.includes("safety")) return <ShieldAlert size={14} />;
                    if (ticket.type === "FEEDBACK") return <Sparkles size={14} />;
                    return <Ticket size={14} />;
                  })()} {ticket.ticketNumber}
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 800, margin: "10px 0 6px", color: "var(--t1)" }}>{ticket.subject}</h2>
                <p style={{ margin: 0, color: "var(--t3)", lineHeight: 1.7, fontSize: 14 }}>{ticket.description || "No description provided yet."}</p>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Badge variant={statusConfig[ticket.status].variant} size="md">{statusConfig[ticket.status].label}</Badge>
                <Badge variant={priorityConfig[ticket.priority].variant} size="md">{priorityConfig[ticket.priority].label} priority</Badge>
              </div>
            </div>
          </GlassCard>

          <div style={{ display: "grid", gap: 16, gridTemplateColumns: "minmax(0, 1.2fr) minmax(320px, 0.8fr)" }}>
            <GlassCard padding="lg">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <MessageSquareText size={16} color="var(--or)" />
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: "var(--t1)" }}>Timeline</h3>
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                {timelineEntries.length === 0 ? (
                  <div style={{ padding: 14, borderRadius: 14, border: "1px dashed var(--b1)", color: "var(--t3)", fontSize: 13 }}>
                    No updates yet. This thread will fill with progress notes as the request moves forward.
                  </div>
                ) : (
                  timelineEntries.map((entry) => (
                    <div key={entry.id} style={{ display: "grid", gap: 8, padding: 14, borderRadius: 16, border: "1px solid var(--b1)", background: "rgba(255,255,255,0.64)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                          <span style={{ display: "inline-flex", width: 30, height: 30, borderRadius: 999, background: "rgba(232,105,44,0.10)", color: "var(--or)", alignItems: "center", justifyContent: "center" }}>
                            {entry.isInternal ? <Headphones size={14} /> : <MessageSquareText size={14} />}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            {entry.isInternal ? "Internal update" : "Customer update"}
                          </span>
                        </div>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--t3)", fontSize: 12 }}>
                          <Clock3 size={12} /> {formatDate(entry.createdAt)}
                        </span>
                      </div>
                      <div style={{ color: "var(--t2)", fontSize: 14, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{entry.body}</div>
                      {entry.body.includes("http") && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {entry.body.split(/\s+/).filter((token) => token.startsWith("http")).map((link, idx) => (
                            <a key={`${link}-${idx}`} href={link} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--or)", fontSize: 12, fontWeight: 600 }}>
                              <Paperclip size={12} /> Open attachment
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </GlassCard>

            <GlassCard padding="lg">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <MessageSquareText size={16} color="var(--or)" />
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: "var(--t1)" }}>Reply</h3>
              </div>
              <textarea
                value={reply}
                rows={5}
                onChange={(event) => setReply(event.target.value)}
                placeholder="Share the next update, include what changed, or ask for anything needed."
                style={{ width: "100%", minHeight: 136, borderRadius: 14, border: "1px solid var(--b1)", padding: 12, fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", background: "rgba(255,255,255,0.78)" }}
              />

              <label style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12, fontSize: 12, fontWeight: 700, color: "var(--t3)" }}>
                Attach images
                <input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={handleUpload} />
              </label>

              {attachments.length > 0 && (
                <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
                  {attachments.map((attachment) => (
                    <div key={attachment.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: 10, borderRadius: 12, border: "1px solid var(--b1)", background: "rgba(255,255,255,0.66)" }}>
                      <FileImage size={14} color="var(--or)" />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{attachment.name}</div>
                        <div style={{ fontSize: 12, color: "var(--t3)" }}>{(attachment.size / 1024).toFixed(0)} KB</div>
                      </div>
                      <a href={attachment.url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "var(--or)", fontWeight: 700 }}>Open</a>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
                <Button size="sm" icon={<Send size={14} />} loading={addReplyMutation.isPending || uploading} onClick={handleReply}>
                  Send update
                </Button>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </PageShell>
  );
}
