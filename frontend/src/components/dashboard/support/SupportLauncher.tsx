"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Headset, MessageSquareText, Sparkles, Ticket, X } from "lucide-react";
import SupportComposerModal, { type FormState } from "./SupportComposerModal";
import Button from "../ui/Button";

type SupportAction = "ticket" | "bug" | "feature" | "feedback" | "tickets";

export default function SupportLauncher() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerType, setComposerType] = useState<FormState["type"] | undefined>(undefined);
  const [composerSubject, setComposerSubject] = useState("");
  const [composerDescription, setComposerDescription] = useState("");

  const handleAction = (action: SupportAction) => {
    setOpen(false);

    if (action === "tickets") {
      router.push("/dashboard/support");
      return;
    }

    const presets: Record<Exclude<SupportAction, "tickets">, { type: FormState["type"]; subject: string; description: string }> = {
      ticket: {
        type: "TICKET",
        subject: "Need help with an operational request",
        description: "Share the context for the issue, affected workflow, and any urgent details.",
      },
      bug: {
        type: "BUG",
        subject: "I found a bug in the dashboard",
        description: "Describe what happened, where it happened, and what you expected instead.",
      },
      feature: {
        type: "FEATURE_REQUEST",
        subject: "I would like a workflow improvement",
        description: "Describe the workflow you want improved and the outcome you would like to see.",
      },
      feedback: {
        type: "FEEDBACK",
        subject: "Feedback about the experience",
        description: "Share any observations about the experience, clarity, or usability of the platform.",
      },
    };

    const preset = presets[action];
    setComposerType(preset.type);
    setComposerSubject(preset.subject);
    setComposerDescription(preset.description);
    setComposerOpen(true);
  };

  return (
    <>
      <motion.button
        type="button"
        className="d-support-launcher"
        onClick={() => setOpen(true)}
        whileHover={{ y: -2, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        aria-label="Open support launcher"
      >
        <Headset size={18} strokeWidth={1.8} />
        <span>Support</span>
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="d-support-launcher-sheet"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <div className="d-support-launcher-sheet-header">
              <div>
                <div className="d-support-launcher-sheet-title">Need help?</div>
                <div className="d-support-launcher-sheet-subtitle">Choose the quickest way to get support without leaving the workspace.</div>
              </div>
              <button className="sb-close-btn" onClick={() => setOpen(false)} aria-label="Close support launcher">
                <X size={14} />
              </button>
            </div>

            <div className="d-support-launcher-sheet-body">
              <button className="d-support-launcher-option" type="button" onClick={() => handleAction("ticket")}>
                <MessageSquareText size={16} />
                <div>
                  <div className="d-support-launcher-option-title">Create ticket</div>
                  <div className="d-support-launcher-option-sub">Start a request for help, service follow-up, or a workflow question.</div>
                </div>
              </button>
              <button className="d-support-launcher-option" type="button" onClick={() => handleAction("bug")}>
                <Sparkles size={16} />
                <div>
                  <div className="d-support-launcher-option-title">Report a bug</div>
                  <div className="d-support-launcher-option-sub">Share a product issue or an unexpected behavior in the app.</div>
                </div>
              </button>
              <button className="d-support-launcher-option" type="button" onClick={() => handleAction("feature")}>
                <Ticket size={16} />
                <div>
                  <div className="d-support-launcher-option-title">Request a feature</div>
                  <div className="d-support-launcher-option-sub">Suggest improvements that would make daily operations smoother.</div>
                </div>
              </button>
              <button className="d-support-launcher-option" type="button" onClick={() => handleAction("feedback")}>
                <BookOpen size={16} />
                <div>
                  <div className="d-support-launcher-option-title">Share feedback</div>
                  <div className="d-support-launcher-option-sub">Tell us what feels strong, confusing, or worth improving.</div>
                </div>
              </button>
            </div>

            <div className="d-support-launcher-actions">
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/support")}>
                View my tickets
              </Button>
              <Button size="sm" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <SupportComposerModal
        open={composerOpen}
        onClose={() => {
          setComposerOpen(false);
          setComposerType(undefined);
          setComposerSubject("");
          setComposerDescription("");
        }}
        initialType={composerType}
        initialSubject={composerSubject}
        initialDescription={composerDescription}
      />
    </>
  );
}
