/**
 * ConfirmDeleteModal — StratumIQ
 * Path: frontend/src/components/dashboard/fleet/modals/ConfirmDeleteModal.tsx
 *
 * Reusable confirmation modal for delete operations.
 * Replaces browser confirm() with a proper modal matching the design system.
 */

"use client";

import { useEffect } from "react";
import { DASH, BRAND } from "@/lib/constants";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  isDeleting?: boolean;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Remove Equipment",
  message = "This action cannot be undone.",
  itemName,
  isDeleting = false,
}: ConfirmDeleteModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (!isDeleting) {
      onConfirm();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleBackdropClick}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "fadeIn 0.2s ease-out",
        }}
      >
        {/* Modal */}
        <div
          style={{
            background: DASH.surface,
            borderRadius: 20,
            width: "90%",
            maxWidth: 420,
            boxShadow: DASH.shadowLg,
            animation: "slideUp 0.25s ease-out",
            overflow: "hidden",
          }}
        >
          {/* Header strip */}
          <div
            style={{
              height: 4,
              background: `linear-gradient(90deg, ${DASH.red}, ${DASH.red}80)`,
            }}
          />

          {/* Content */}
          <div style={{ padding: "24px 24px 20px" }}>
            {/* Icon */}
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 99,
                background: "rgba(220, 38, 38, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke={DASH.red}
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <circle cx="12" cy="16" r="0.5" fill={DASH.red} stroke="none" />
              </svg>
            </div>

            {/* Title */}
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: DASH.text,
                marginBottom: 8,
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </h3>

            {/* Message */}
            <p
              style={{
                fontSize: 13.5,
                color: DASH.text2,
                lineHeight: 1.5,
                marginBottom: itemName ? 8 : 20,
              }}
            >
              {message}
            </p>

            {/* Item name highlight */}
            {itemName && (
              <div
                style={{
                  background: DASH.surface2,
                  borderRadius: 10,
                  padding: "10px 14px",
                  marginBottom: 20,
                  border: `1px solid ${DASH.border}`,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: DASH.text,
                    display: "block",
                    wordBreak: "break-word",
                  }}
                >
                  {itemName}
                </span>
              </div>
            )}

            {/* Warning text */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 0",
                marginBottom: 20,
                borderTop: `1px solid ${DASH.border2}`,
                borderBottom: `1px solid ${DASH.border2}`,
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke={DASH.amber}
                strokeWidth="2"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span style={{ fontSize: 12, color: DASH.text3 }}>
                This will permanently delete the equipment and all associated service records.
              </span>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={onClose}
                disabled={isDeleting}
                className="btn-secondary"
                style={{
                  height: 38,
                  padding: "0 18px",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isDeleting}
                style={{
                  height: 38,
                  padding: "0 20px",
                  borderRadius: 9,
                  background: DASH.red,
                  color: "#fff",
                  border: "none",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "background 0.15s",
                  opacity: isDeleting ? 0.6 : 1,
                }}
                onMouseOver={(e) => {
                  if (!isDeleting)
                    (e.currentTarget as HTMLElement).style.background = "#B91C1C";
                }}
                onMouseOut={(e) => {
                  if (!isDeleting)
                    (e.currentTarget as HTMLElement).style.background = DASH.red;
                }}
              >
                {isDeleting ? (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2"
                      style={{ animation: "spin 0.8s linear infinite" }}
                    >
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                      <path d="M12 2a10 10 0 0110 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Removing...
                  </>
                ) : (
                  "Remove Equipment"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}