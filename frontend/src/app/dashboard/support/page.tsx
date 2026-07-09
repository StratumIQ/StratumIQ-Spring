"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Headphones, Ticket, Clock3, Bug, Wrench, Settings, FileEdit, Trash2, Truck, Package, CreditCard, Phone, Mail, MessageCircle, LifeBuoy } from "lucide-react";
import SupportComposerModal, { loadDraft, clearDraft, type FormState as DraftFormState } from "@/components/dashboard/support/SupportComposerModal";
import AIAssistant from "@/components/dashboard/AIAssistant";
import { toast } from "sonner";
import PageShell from "@/components/dashboard/layout/PageShell";
import GlassCard from "@/components/dashboard/ui/GlassCard";
import Button from "@/components/dashboard/ui/Button";
import Badge from "@/components/dashboard/ui/Badge";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import Skeleton from "@/components/dashboard/ui/Skeleton";
import { ApiError, dashApi } from "@/lib/api/client";

const SUPPORT_PHONE = "+1 (800) 555-0199";
const SUPPORT_EMAIL = "support@stratumiq.com";

const CHAT_SUGGESTIONS = ["Track my ticket", "Report an equipment issue", "Talk to a human", "Billing question"];
const CHAT_SYSTEM_PROMPT = `You are the StratumIQ Support Assistant — helpful, concise, professional.
You help customers with fleet, equipment, service, orders, and billing questions, and guide them to raise a support ticket when you can't resolve the issue yourself.
Keep responses concise (2–4 sentences). If the user needs a human, tell them to use "Raise an issue" to open a ticket.`;

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

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showComposer, setShowComposer] = useState(false);
  const [showChat, setShowChat] = useState(false);
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

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["dashboard", "support", "tickets"],
    queryFn: () => dashApi<SupportTicket[]>("/support/tickets?page=1&limit=5"),
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

  return (
    <>
      <PageShell
        title="Support Center"
        description="We're here to help. Choose how you'd like to reach us."
      >
        <div style={{ display: "grid", gap: 24 }}>
          <div className="d-support-contact-grid">
            <a href={`tel:${SUPPORT_PHONE.replace(/[^+\d]/g, "")}`} className="d-support-contact-tile">
              <span className="d-support-contact-icon" style={{ color: "#0EA5A5", background: "#0EA5A514", borderColor: "#0EA5A528" }}>
                <Phone size={20} />
              </span>
              <div>
                <div className="d-support-contact-title">Call Us</div>
                <div className="d-support-contact-sub">{SUPPORT_PHONE}</div>
              </div>
            </a>

            <a href={`mailto:${SUPPORT_EMAIL}`} className="d-support-contact-tile">
              <span className="d-support-contact-icon" style={{ color: "#2563EB", background: "#2563EB14", borderColor: "#2563EB28" }}>
                <Mail size={20} />
              </span>
              <div>
                <div className="d-support-contact-title">Email Us</div>
                <div className="d-support-contact-sub">{SUPPORT_EMAIL}</div>
              </div>
            </a>

            <button type="button" className="d-support-contact-tile" onClick={() => setShowComposer(true)}>
              <span className="d-support-contact-icon" style={{ color: "var(--or)", background: "var(--or-10)", borderColor: "var(--or-25)" }}>
                <LifeBuoy size={20} />
              </span>
              <div>
                <div className="d-support-contact-title">Raise an Issue</div>
                <div className="d-support-contact-sub">Open a support ticket</div>
              </div>
            </button>

            <button type="button" className="d-support-contact-tile" onClick={() => setShowChat(true)}>
              <span className="d-support-contact-icon" style={{ color: "#16A34A", background: "#16A34A14", borderColor: "#16A34A28" }}>
                <MessageCircle size={20} />
              </span>
              <div>
                <div className="d-support-contact-title">Live Chat</div>
                <div className="d-support-contact-sub">Chat with our assistant</div>
              </div>
            </button>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--t1)", margin: 0 }}>Your recent requests</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowComposer(true)}>
                New request
              </Button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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

      {showChat ? (
        <div style={{ position: "fixed", bottom: 96, right: 24, zIndex: 60 }}>
          <AIAssistant
            floating
            title="Live Support Chat"
            welcomeMessage="Hi! I'm the StratumIQ support assistant. Ask me about your fleet, equipment, orders, or billing — or I can point you to a human."
            systemPrompt={CHAT_SYSTEM_PROMPT}
            suggestions={CHAT_SUGGESTIONS}
            onClose={() => setShowChat(false)}
          />
        </div>
      ) : null}

      <motion.button
        type="button"
        onClick={() => setShowChat((open) => !open)}
        className="d-support-fab"
        whileHover={{ y: -2, scale: 1.04, boxShadow: "0 20px 40px rgba(232,105,44,0.32)" }}
        whileTap={{ scale: 0.96 }}
        aria-label="Live chat"
        title="Live chat"
      >
        <Headphones size={24} />
      </motion.button>

      <SupportComposerModal open={showComposer} onClose={() => setShowComposer(false)} onSubmitted={() => queryClient.invalidateQueries({ queryKey: ["dashboard", "support", "tickets"] })} />
    </>
  );
}
