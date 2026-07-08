"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Headphones, Plus, Ticket, Clock3, CheckCircle2, Bug, Wrench, Settings, FileEdit, Trash2, Truck, Package, CreditCard } from "lucide-react";
import KpiCard from "@/components/dashboard/common/KpiCard";
import SupportComposerModal, { loadDraft, clearDraft, type FormState as DraftFormState } from "@/components/dashboard/support/SupportComposerModal";
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
  type: "FLEET" | "EQUIPMENT" | "SERVICE" | "ORDER" | "BILLING_ACCOUNT" | "PLATFORM" | "OTHER";
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
  type: "FLEET" | "EQUIPMENT" | "SERVICE" | "ORDER" | "BILLING_ACCOUNT" | "PLATFORM" | "OTHER";
  subject: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
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
  const [draft, setDraft] = useState<DraftFormState | null>(null);

  useEffect(() => {
    const refreshDraft = () => setDraft(loadDraft());
    refreshDraft();
    window.addEventListener("support-draft-changed", refreshDraft);
    window.addEventListener("storage", refreshDraft);
    return () => {
      window.removeEventListener("support-draft-changed", refreshDraft);
      window.removeEventListener("storage", refreshDraft);
    };
  }, []);

  const handleDeleteDraft = () => {
    clearDraft();
    setDraft(null);
  };
  const [form, setForm] = useState<CreateTicketPayload>({
    type: "OTHER",
    subject: "",
    description: "",
    priority: "MEDIUM",
  });

  useEffect(() => {
    const requestedType = searchParams.get("type")?.toLowerCase();
    if (requestedType === "feedback") {
      setForm((prev) => ({ ...prev, type: "OTHER" }));
    } else if (requestedType === "manual") {
      setForm((prev) => ({ ...prev, type: "SERVICE" }));
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

  const createTicketMutation = useMutation({
    mutationFn: (payload: CreateTicketPayload) =>
      dashApi<SupportTicket>("/support/tickets", { method: "POST", body: payload }),
    onSuccess: (ticket) => {
      toast.success("Request submitted successfully");
      setShowComposer(false);
      setForm({ type: "OTHER", subject: "", description: "", priority: "MEDIUM" });
      setSelectedId(ticket.id);
      queryClient.invalidateQueries({ queryKey: ["dashboard", "support", "tickets"] });
      router.replace("/dashboard/support");
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "We couldn’t create your request";
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

          <div style={{ display: "grid", gap: 12 }}>
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

              {draft ? (
                <GlassCard padding="md" className="d-support-draft-card">
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "flex", gap: 10 }}>
                      <span style={{ color: "var(--or)", display: "inline-flex", marginTop: 2 }}>
                        <FileEdit size={16} />
                      </span>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--or)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            Draft
                          </span>
                        </div>
                        <div style={{ marginTop: 4, fontSize: 15, fontWeight: 700, color: "var(--t1)" }}>
                          {draft.subject.trim() || "Untitled draft"}
                        </div>
                        <p style={{ margin: "6px 0 0", color: "var(--t3)", fontSize: 13, lineHeight: 1.5 }}>
                          {draft.description.trim() || "No description yet."}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <Button size="sm" variant="outline" onClick={() => setShowComposer(true)}>
                        Continue editing
                      </Button>
                      <Button size="sm" variant="ghost" icon={<Trash2 size={14} />} onClick={handleDeleteDraft}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ) : null}

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
                      if (key.includes("fleet")) return <Truck size={15} />;
                      if (key.includes("equipment")) return <Settings size={15} />;
                      if (key.includes("service")) return <Wrench size={15} />;
                      if (key.includes("order")) return <Package size={15} />;
                      if (key.includes("billing") || key.includes("account")) return <CreditCard size={15} />;
                      if (key.includes("platform")) return <Bug size={15} />;
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
