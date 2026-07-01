"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Headset, Paperclip, X } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/dashboard/ui/Button";
import { ApiError, dashApi } from "@/lib/api/client";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
  initialType?: FormState["type"];
  initialPriority?: FormState["priority"];
  initialSubject?: string;
  initialDescription?: string;
};

export type FormState = {
  type: "TICKET" | "FEEDBACK" | "BUG" | "UI_ISSUE" | "PERFORMANCE" | "INTEGRATION" | "FEATURE_REQUEST" | "GENERAL_QUESTION";
  priority: "LOW" | "MEDIUM" | "HIGH";
  subject: string;
  description: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const INITIAL_FORM: FormState = {
  type: "TICKET",
  priority: "MEDIUM",
  subject: "",
  description: "",
};

export default function SupportComposerModal({
  open,
  onClose,
  onSubmitted,
  initialType,
  initialPriority,
  initialSubject,
  initialDescription,
}: Props) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        type: initialType ?? INITIAL_FORM.type,
        priority: initialPriority ?? INITIAL_FORM.priority,
        subject: initialSubject ?? "",
        description: initialDescription ?? "",
      });
      setErrors({});
      setSubmitting(false);
      return;
    }

    setForm(INITIAL_FORM);
    setErrors({});
    setSubmitting(false);
  }, [open, initialType, initialPriority, initialSubject, initialDescription]);

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!form.subject.trim()) nextErrors.subject = "Please add a short subject.";
    if (!form.description.trim()) nextErrors.description = "Please describe the issue so we can help quickly.";
    if (form.description.trim().length < 12) nextErrors.description = "Add a bit more detail so the team can triage it properly.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      await dashApi("/support/tickets", {
        method: "POST",
        body: {
          type: form.type,
          priority: form.priority,
          subject: form.subject.trim(),
          description: form.description.trim(),
        },
      });
      toast.success("Support request submitted");
      onSubmitted?.();
      onClose();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "We couldn’t submit your request right now.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="d-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="d-modal"
            initial={{ opacity: 0, y: 14, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.985 }}
            transition={{ duration: 0.2 }}
            onClick={(event) => event.stopPropagation()}
            style={{ maxWidth: 640 }}
          >
            <div className="d-modal-header">
              <div>
                <div className="d-modal-title">Create a support request</div>
                <div className="d-page-subtitle" style={{ marginTop: 4 }}>Tell us what you need help with and we’ll keep it moving.</div>
              </div>
              <button className="sb-close-btn" onClick={onClose} aria-label="Close support form">
                <X size={14} />
              </button>
            </div>

            <div className="d-modal-body" style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--t2)" }}>
                  Issue type
                  <select
                    className="dash-input"
                    value={form.type}
                    onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as FormState["type"] }))}
                  >
                    <option value="FEEDBACK">Feedback</option>
                    <option value="BUG">Bug</option>
                    <option value="UI_ISSUE">UI issue</option>
                    <option value="PERFORMANCE">Performance</option>
                    <option value="INTEGRATION">Integration</option>
                    <option value="FEATURE_REQUEST">Feature request</option>
                    <option value="GENERAL_QUESTION">General question</option>
                    <option value="TICKET">Service request</option>
                  </select>
                  {errors.type ? <span style={{ color: "var(--or)", fontSize: 12 }}>{errors.type}</span> : null}
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--t2)" }}>
                  Priority
                  <select
                    className="dash-input"
                    value={form.priority}
                    onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as FormState["priority"] }))}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </label>
              </div>

              <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--t2)" }}>
                Subject
                <input
                  className="dash-input"
                  value={form.subject}
                  onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
                  placeholder="Short summary of the issue"
                />
                {errors.subject ? <span style={{ color: "var(--or)", fontSize: 12 }}>{errors.subject}</span> : null}
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--t2)" }}>
                Description
                <textarea
                  className="dash-input"
                  rows={6}
                  maxLength={1400}
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Share the impact, affected workflow, and any details the team should know."
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "var(--t3)" }}>
                  <span>{errors.description ? <span style={{ color: "var(--or)" }}>{errors.description}</span> : "A clear description helps us resolve the issue faster."}</span>
                  <span>{form.description.length}/1400</span>
                </div>
              </label>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 14px", borderRadius: 12, border: "1px solid var(--b1)", background: "var(--s1)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Paperclip size={14} color="var(--or)" />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>Attachments</div>
                    <div style={{ fontSize: 12, color: "var(--t3)" }}>Coming soon</div>
                  </div>
                </div>
                <span style={{ fontSize: 12, color: "var(--t3)" }}>Disabled for now</span>
              </div>
            </div>

            <div className="d-modal-footer">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} loading={submitting} icon={<Headset size={14} />}>
                Submit ticket
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
