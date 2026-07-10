"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Headset, Paperclip, FileImage, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/dashboard/ui/Button";
import { ApiError, dashApi } from "@/lib/api/client";
import { uploadImage } from "@/lib/imageUtils";

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
  type: "" | "FLEET" | "EQUIPMENT" | "SERVICE" | "ORDER" | "BILLING_ACCOUNT" | "PLATFORM" | "OTHER";
  priority: "" | "LOW" | "MEDIUM" | "HIGH";
  subject: string;
  description: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

type UploadedAttachment = {
  id: string;
  name: string;
  url: string;
  size: number;
};

function buildDescriptionWithAttachments(description: string, attachments: UploadedAttachment[]) {
  if (!attachments.length) return description.trim();
  const lines = [description.trim(), "", "Attachments:"];
  attachments.forEach(({ name, url }) => { lines.push(`- ${name}: ${url}`); });
  return lines.join("\n");
}

const INITIAL_FORM: FormState = {
  type: "",
  priority: "",
  subject: "",
  description: "",
};

export const DRAFT_STORAGE_KEY = "support-composer-draft";

const isDraftWorthKeeping = (draft: FormState) =>
  draft.subject.trim().length > 0 || draft.description.trim().length > 0;

export const loadDraft = (): FormState | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FormState;
    return isDraftWorthKeeping(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const saveDraft = (draft: FormState) => {
  if (typeof window === "undefined") return;
  if (!isDraftWorthKeeping(draft)) {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
  } else {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  }
  window.dispatchEvent(new Event("support-draft-changed"));
};

export const clearDraft = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DRAFT_STORAGE_KEY);
  window.dispatchEvent(new Event("support-draft-changed"));
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
  const [draftRestored, setDraftRestored] = useState(false);
  const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const skipNextAutosave = useRef(false);

  useEffect(() => {
    if (open) {
      const hasPrefill = Boolean(initialSubject || initialDescription);
      const draft = hasPrefill ? null : loadDraft();

      skipNextAutosave.current = true;
      setForm({
        type: draft?.type ?? initialType ?? INITIAL_FORM.type,
        priority: draft?.priority ?? initialPriority ?? INITIAL_FORM.priority,
        subject: draft?.subject ?? initialSubject ?? "",
        description: draft?.description ?? initialDescription ?? "",
      });
      setDraftRestored(Boolean(draft));
      setErrors({});
      setSubmitting(false);
      setAttachments([]);
      return;
    }

    setForm(INITIAL_FORM);
    setDraftRestored(false);
    setErrors({});
    setSubmitting(false);
    setAttachments([]);
  }, [open, initialType, initialPriority, initialSubject, initialDescription]);

  useEffect(() => {
    if (!open) return;
    if (skipNextAutosave.current) {
      skipNextAutosave.current = false;
      return;
    }
    saveDraft(form);
    setDraftRestored((current) => current && isDraftWorthKeeping(form));
  }, [open, form]);

  const handleDiscardDraft = () => {
    clearDraft();
    skipNextAutosave.current = true;
    setForm(INITIAL_FORM);
    setDraftRestored(false);
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    setUploading(true);
    try {
      const uploaded: UploadedAttachment[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadImage(file, "fleet");
        uploaded.push({
          id: `${file.name}-${Date.now()}`,
          name: file.name,
          url,
          size: file.size,
        });
      }
      setAttachments((current) => [...current, ...uploaded]);
      toast.success(`${uploaded.length} attachment${uploaded.length > 1 ? "s" : ""} added`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((current) => current.filter((attachment) => attachment.id !== id));
  };

  const validate = () => {
    const nextErrors: FormErrors = {};
    if (!form.type) nextErrors.type = "Please select an issue type.";
    if (!form.priority) nextErrors.priority = "Please select a priority.";
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
          description: buildDescriptionWithAttachments(form.description, attachments),
        },
      });
      clearDraft();
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
              {draftRestored ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid var(--b1)",
                    background: "var(--s1)",
                    fontSize: 12,
                    color: "var(--t3)",
                  }}
                >
                  <span>Restored your unsent draft.</span>
                  <button
                    type="button"
                    onClick={handleDiscardDraft}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      background: "none",
                      border: "none",
                      color: "var(--or)",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    <Trash2 size={12} /> Discard draft
                  </button>
                </div>
              ) : null}

              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--t2)" }}>
                  <span>Issue type <span style={{ color: "var(--or)" }}>*</span></span>
                  <select
                    className="dash-input"
                    value={form.type}
                    onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as FormState["type"] }))}
                    style={{ fontWeight: form.type ? 500 : 400, color: form.type ? "var(--t1)" : "var(--t3)" }}
                  >
                    <option value="" disabled>Select issue type</option>
                    <option value="FLEET">Fleet</option>
                    <option value="EQUIPMENT">Equipment</option>
                    <option value="SERVICE">Service</option>
                    <option value="ORDER">Order / Aftermarket</option>
                    <option value="BILLING_ACCOUNT">Billing / Account</option>
                    <option value="PLATFORM">Platform</option>
                    <option value="OTHER">Other</option>
                  </select>
                  {errors.type ? <span style={{ color: "var(--or)", fontSize: 12 }}>{errors.type}</span> : null}
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--t2)" }}>
                  <span>Priority <span style={{ color: "var(--or)" }}>*</span></span>
                  <select
                    className="dash-input"
                    value={form.priority}
                    onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as FormState["priority"] }))}
                    style={{ fontWeight: form.priority ? 500 : 400, color: form.priority ? "var(--t1)" : "var(--t3)" }}
                  >
                    <option value="" disabled>Select priority</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                  {errors.priority ? <span style={{ color: "var(--or)", fontSize: 12 }}>{errors.priority}</span> : null}
                </label>
              </div>

              <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--t2)" }}>
                <span>Subject <span style={{ color: "var(--or)" }}>*</span></span>
                <input
                  className="dash-input"
                  value={form.subject}
                  onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
                  placeholder="Briefly summarize the issue"
                />
                {errors.subject ? <span style={{ color: "var(--or)", fontSize: 12 }}>{errors.subject}</span> : null}
              </label>

              <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--t2)" }}>
                <span>Description <span style={{ color: "var(--or)" }}>*</span></span>
                <textarea
                  className="dash-input"
                  rows={6}
                  maxLength={1400}
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Describe the issue and any details that would help us resolve it."
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: "var(--t3)" }}>
                  <span>{errors.description ? <span style={{ color: "var(--or)" }}>{errors.description}</span> : "A clear description helps us resolve the issue faster."}</span>
                  <span>{form.description.length}/1400</span>
                </div>
              </label>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "12px 14px", borderRadius: 12, border: "1px solid var(--b1)", background: "var(--s1)" }}>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Paperclip size={14} color="var(--or)" />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>Attachments</div>
                      <div style={{ fontSize: 12, color: "var(--t3)" }}>PNG, JPEG or WEBP, up to 5 MB each</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: "var(--or)", fontWeight: 700 }}>{uploading ? "Uploading…" : "+ Add files"}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    onChange={handleUpload}
                    disabled={uploading}
                    style={{ display: "none" }}
                  />
                </label>

                {attachments.length > 0 ? (
                  <div style={{ display: "grid", gap: 6 }}>
                    {attachments.map((attachment) => (
                      <div key={attachment.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, border: "1px solid var(--b1)", background: "var(--s0)" }}>
                        <FileImage size={14} color="var(--or)" />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--t1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{attachment.name}</div>
                          <div style={{ fontSize: 11.5, color: "var(--t3)" }}>{(attachment.size / 1024).toFixed(0)} KB</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(attachment.id)}
                          aria-label={`Remove ${attachment.name}`}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--t3)", display: "flex", padding: 4 }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="d-modal-footer">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} loading={submitting || uploading} icon={<Headset size={14} />}>
                Submit ticket
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
