"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Headphones, MessageSquareText, Plus, Send, Sparkles, Ticket, Clock3, ChevronRight, CheckCircle2, Bug, Wrench, HelpCircle, ShieldAlert, Settings } from "lucide-react";
import KpiCard from "@/components/dashboard/common/KpiCard";
import SupportComposerModal from "@/components/dashboard/support/SupportComposerModal";
import { toast } from "sonner";
import PageShell from "@/components/dashboard/layout/PageShell";
import FilterBar from "@/components/dashboard/common/FilterBar";
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
  assignedTo: number | null;
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string | null;
  notes?: Array<{
    id: number;
    body: string;
    isInternal: boolean;
    createdAt: string;
  }>;
};

type CreateTicketPayload = {
  type: "TICKET" | "FEEDBACK";
  subject: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
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

export default function SupportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showComposer, setShowComposer] = useState(false);
  const [reply, setReply] = useState("");
  const [form, setForm] = useState<CreateTicketPayload>({
    type: "TICKET",
    subject: "",
    description: "",
    priority: "MEDIUM",
  });

  useEffect(() => {
    const requestedType = searchParams.get("type")?.toLowerCase();
    if (requestedType === "feedback") {
      setForm((prev) => ({ ...prev, type: "FEEDBACK" }));
    } else if (requestedType === "manual") {
      setForm((prev) => ({ ...prev, type: "TICKET" }));
    }
  }, [searchParams]);

  const { data: tickets = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ["dashboard", "support", "tickets", search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());
      params.set("page", "1");
      params.set("limit", "10");
      const suffix = params.toString() ? `?${params.toString()}` : "";
      return dashApi<SupportTicket[]>(`/support/tickets${suffix}`);
    },
  });

  useEffect(() => {
    if (tickets.length && selectedId === null) {
      setSelectedId(tickets[0].id);
    }
    if (!tickets.length) {
      setSelectedId(null);
    }
  }, [tickets, selectedId]);

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedId) ?? null,
    [selectedId, tickets],
  );

  const { data: detailTicket, isLoading: detailLoading } = useQuery({
    queryKey: ["dashboard", "support", "ticket", selectedId],
    queryFn: () => dashApi<SupportTicket>(`/support/tickets/${selectedId}`),
    enabled: Boolean(selectedId),
    staleTime: 10000,
  });

  const createTicketMutation = useMutation({
    mutationFn: (payload: CreateTicketPayload) =>
      dashApi<SupportTicket>("/support/tickets", { method: "POST", body: payload }),
    onSuccess: (ticket) => {
      toast.success("Request submitted successfully");
      setShowComposer(false);
      setForm({ type: "TICKET", subject: "", description: "", priority: "MEDIUM" });
      setSelectedId(ticket.id);
      queryClient.invalidateQueries({ queryKey: ["dashboard", "support", "tickets"] });
      router.replace("/dashboard/support");
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "We couldn’t create your request";
      toast.error(message);
    },
  });

  const addReplyMutation = useMutation({
    mutationFn: (payload: ReplyPayload) =>
      dashApi<SupportTicket>(`/support/tickets/${selectedId}/notes`, {
        method: "POST",
        body: payload,
      }),
    onSuccess: () => {
      toast.success("Reply sent");
      setReply("");
      queryClient.invalidateQueries({ queryKey: ["dashboard", "support", "ticket", selectedId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "support", "tickets"] });
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "We couldn’t send that reply";
      toast.error(message);
    },
  });

  const handleCreate = () => {
    if (!form.subject.trim() || !form.description.trim()) {
      toast.error("Please fill out the subject and details before submitting.");
      return;
    }

    createTicketMutation.mutate(form);
  };

  const handleReply = () => {
    if (!reply.trim() || !selectedId) return;
    addReplyMutation.mutate({ body: reply.trim() });
  };

  const summary = useMemo(() => {
    const resolved = tickets.filter((ticket) => ticket.status === "RESOLVED").length;
    const open = tickets.filter((ticket) => ticket.status !== "RESOLVED").length;
    return { resolved, open };
  }, [tickets]);

  return (
    <>
      <PageShell
        title="Support Center"
        description="Manage and track all your support requests."
        actions={
          <Button variant="outline" size="sm" icon={<Plus size={14} />} onClick={() => setShowComposer(true)}>
            New request
          </Button>
        }
      >
        <div style={{ display: "grid", gap: 12 }}>
          <div className="d-kpi-grid" style={{ marginBottom: 6 }}>
            <KpiCard label="Open" value={tickets.filter((t) => t.status !== "RESOLVED").length} icon={<Ticket size={18} />} color="#E8692C" />
            <KpiCard label="Assigned" value={tickets.filter((t) => t.status === "ASSIGNED").length} icon={<CheckCircle2 size={18} />} color="#0EA5A5" />
            <KpiCard label="Waiting" value={tickets.filter((t) => t.status === "WAITING_CUSTOMER").length} icon={<Clock3 size={18} />} color="#F59E0B" />
            <KpiCard label="Resolved" value={tickets.filter((t) => t.status === "RESOLVED").length} icon={<Ticket size={18} />} color="#10B981" />
          </div>

          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "minmax(0, 1.15fr) minmax(320px, 0.85fr)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <FilterBar
                search={search}
                onSearchChange={(value) => setSearch(value)}
                searchPlaceholder="Search tickets or subjects"
                selects={[
                  {
                    key: "status",
                    value: statusFilter,
                    options: [
                      { value: "all", label: "All statuses" },
                      { value: "OPEN", label: "Open" },
                      { value: "ASSIGNED", label: "Assigned" },
                      { value: "IN_PROGRESS", label: "In progress" },
                      { value: "WAITING_CUSTOMER", label: "Waiting customer" },
                      { value: "RESOLVED", label: "Resolved" },
                    ],
                    onChange: setStatusFilter,
                    width: 190,
                  },
                ]}
                trailing={
                  <Button variant="outline" size="sm" icon={<Headphones size={14} />} onClick={() => setShowComposer(true)}>
                    New request
                  </Button>
                }
              />

              {isLoading ? (
                <div style={{ display: "grid", gap: 12 }}>
                  {[1, 2, 3].map((item) => (
                    <GlassCard key={item} padding="md">
                      <Skeleton height={18} width="55%" />
                      <Skeleton height={12} width="80%" className="d-mt-2" />
                      <Skeleton height={12} width="40%" className="d-mt-2" />
                    </GlassCard>
                  ))}
                </div>
              ) : tickets.length === 0 ? (
                <EmptyState
                  icon={Ticket}
                  title="No support tickets yet"
                  description="Start a new request and we’ll keep the thread organized for you."
                  action={{ label: "Create a request", onClick: () => setShowComposer(true) }}
                />
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {tickets.map((ticket) => {
                    const status = statusConfig[ticket.status];
                    const priority = priorityConfig[ticket.priority];
                    const isActive = ticket.id === selectedId;
                    const issueType = (ticket as any).issueType as string | undefined;
                    const getTicketIcon = () => {
                      const key = (issueType || ticket.type || "").toString().toLowerCase();
                      if (key.includes("bug")) return <Bug size={15} />;
                      if (key.includes("feature")) return <Sparkles size={15} />;
                      if (key.includes("question") || key.includes("help")) return <HelpCircle size={15} />;
                      if (key.includes("equipment") || key.includes("equipment_issue") || key.includes("equipment issue") || key.includes("asset")) return <Settings size={15} />;
                      if (key.includes("maintenance")) return <Wrench size={15} />;
                      if (key.includes("safety")) return <ShieldAlert size={15} />;
                      if (ticket.type === "FEEDBACK") return <Sparkles size={15} />;
                      return <Ticket size={15} />;
                    };
                    return (
                      <motion.button
                        key={ticket.id}
                        type="button"
                        onClick={() => {
                          setSelectedId(ticket.id);
                          router.push(`/dashboard/support/${ticket.id}`);
                        }}
                        className={`d-support-ticket-card${isActive ? " d-support-ticket-card--active" : ""}`}
                        whileHover={{ y: -2, scale: 1.005 }}
                        transition={{ duration: 0.16 }}
                      >
                        <div className="d-support-ticket-card-head">
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ color: "var(--or)", display: "inline-flex" }}>{getTicketIcon()}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--t3)" }}>{ticket.ticketNumber}</span>
                          </div>
                          <Badge variant={status.variant} size="md">
                            {status.label}
                          </Badge>
                        </div>
                        <div style={{ marginTop: 10, fontSize: 15, fontWeight: 700, color: "var(--t1)" }}>{ticket.subject}</div>
                        <p style={{ margin: "8px 0 8px", color: "var(--t3)", fontSize: 13, lineHeight: 1.55 }}>
                          {ticket.description || "No description provided yet."}
                        </p>
                        <div className="d-support-ticket-card-meta">
                          <Badge variant={priority.variant} size="sm">
                            {priority.label} priority
                          </Badge>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <Clock3 size={12} /> {formatDate(ticket.createdAt)}
                          </span>
                          <span className="d-support-ticket-card-open">Open thread →</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <GlassCard padding="lg">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--t3)" }}>Conversation</div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: "4px 0 0", color: "var(--t1)" }}>
                      {selectedTicket ? selectedTicket.subject : "Select a request"}
                    </h3>
                  </div>
                  {selectedTicket && (
                    <Badge variant={statusConfig[selectedTicket.status].variant} size="md">
                      {statusConfig[selectedTicket.status].label}
                    </Badge>
                  )}
                </div>

                {!selectedTicket ? (
                  <div style={{ marginTop: 18 }}>
                    <EmptyState icon={MessageSquareText} title="No conversation selected" description="Pick a ticket from the list to view the full thread." />
                  </div>
                ) : detailLoading ? (
                  <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
                    <Skeleton height={54} />
                    <Skeleton height={54} />
                    <Skeleton height={54} />
                  </div>
                ) : (
                  <>
                    <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
                      <div className="d-support-thread-card">
                        <div style={{ fontSize: 13, color: "var(--t3)" }}>Request details</div>
                        <div style={{ marginTop: 6, lineHeight: 1.7, color: "var(--t2)", fontSize: 14 }}>
                          {detailTicket?.description || "No additional context has been shared yet."}
                        </div>
                      </div>
                      <div className="d-support-thread-card d-support-thread-card--soft">
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                          <MessageSquareText size={16} color="var(--or)" />
                          <span style={{ fontWeight: 700, color: "var(--t1)" }}>Timeline</span>
                        </div>
                        {(!detailTicket?.notes || detailTicket.notes.length === 0) ? (
                          <div style={{ color: "var(--t3)", fontSize: 13 }}>No updates yet. We’ll show the latest notes here.</div>
                        ) : (
                          <div className="d-support-thread-list">
                            {detailTicket.notes.map((note) => (
                              <div key={note.id} className="d-support-thread-item">
                                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                                  <span style={{ fontSize: 12, color: "var(--t3)" }}>{note.isInternal ? "Internal note" : "Customer update"}</span>
                                  <span style={{ fontSize: 12, color: "var(--t3)" }}>{formatDate(note.createdAt)}</span>
                                </div>
                                <div style={{ marginTop: 6, fontSize: 13, color: "var(--t2)", lineHeight: 1.6 }}>{note.body}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="d-support-update-box">
                      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "var(--t3)", marginBottom: 8 }} htmlFor="reply">
                        Add an update
                      </label>
                      <textarea
                        id="reply"
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        rows={4}
                        className="d-support-update-textarea"
                        placeholder="Share an update for the support team…"
                      />
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
                        <Button size="sm" icon={<Send size={14} />} loading={addReplyMutation.isPending} onClick={handleReply}>
                          Send update
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </GlassCard>
            </div>
          </div>
        </div>
      </PageShell>

      <motion.button
        type="button"
        onClick={() => setShowComposer(true)}
        className="d-support-fab"
        whileHover={{ y: -2, scale: 1.04, boxShadow: "0 20px 40px rgba(232,105,44,0.32)" }}
        whileTap={{ scale: 0.96 }}
        aria-label="Support"
        title="Support"
      >
        <Headphones size={24} />
      </motion.button>

      <SupportComposerModal open={showComposer} onClose={() => setShowComposer(false)} onSubmitted={() => queryClient.invalidateQueries({ queryKey: ["dashboard", "support", "tickets"] })} />
    </>
  );
}
