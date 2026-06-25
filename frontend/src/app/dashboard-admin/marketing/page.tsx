"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getMarketing,
  createMarketing,
  updateMarketing,
  updateMarketingStatus,
  MarketingItem,
  deleteMarketing,
} from "@/lib/api/marketing";

export default function MarketingPage() {
  // State
  const [marketing, setMarketing] = useState<MarketingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MarketingItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<MarketingItem | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  // Load marketing data
  const loadMarketing = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMarketing();
      setMarketing(response.marketing);
    } catch (error) {
      console.error("Failed to load marketing", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMarketing();
  }, [loadMarketing]);

  // Create handlers
  const handleCreate = async () => {
    try {
      await createMarketing({
        type: "NEWS",
        title,
        body,
        isActive: true,
        sortOrder: 1,
      });
      setShowCreateModal(false);
      setTitle("");
      setBody("");
      await loadMarketing();
    } catch (error) {
      console.error("Failed to create marketing content", error);
    }
  };

  // Edit handlers
  const openEditModal = (item: MarketingItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditBody(item.body || "");
  };

  const handleUpdate = async () => {
    if (!editingItem) return;
    try {
      await updateMarketing(editingItem.id, {
        title: editTitle,
        body: editBody,
      });
      setEditingItem(null);
      await loadMarketing();
    } catch (error) {
      console.error("Failed to update marketing", error);
    }
  };

  // Status toggle
  const handleToggleStatus = async (item: MarketingItem) => {
    try {
      await updateMarketingStatus(item.id, !item.isActive);
      await loadMarketing();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  // Delete handlers
  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await deleteMarketing(deleteItem.id);
      setDeleteItem(null);
      await loadMarketing();
    } catch (error) {
      console.error("Failed to delete marketing", error);
    }
  };

  // Modal close helpers
  const closeCreateModal = () => {
    setShowCreateModal(false);
    setTitle("");
    setBody("");
  };

  const closeEditModal = () => {
    setEditingItem(null);
    setEditTitle("");
    setEditBody("");
  };

  // Styles
  const styles = {
    container: {
      padding: "24px",
    },
    header: {
      display: "flex",
      justifyContent: "space-between" as const,
      alignItems: "center",
      marginBottom: "24px",
    },
    primaryButton: {
      background: "#E8692C",
      color: "#fff",
      border: "none",
      padding: "10px 18px",
      borderRadius: "8px",
      cursor: "pointer" as const,
    },
    tableWrapper: {
      background: "#fff",
      borderRadius: "12px",
      padding: "20px",
      overflowX: "auto" as const,
    },
    table: {
      width: "100%",
      borderCollapse: "collapse" as const,
    },
    statusButton: (isActive: boolean) => ({
      border: "none",
      padding: "6px 12px",
      borderRadius: "999px",
      cursor: "pointer" as const,
      fontWeight: 600,
      background: isActive ? "#dcfce7" : "#fee2e2",
      color: isActive ? "#166534" : "#991b1b",
    }),
    actionButton: {
      background: "transparent",
      border: "none",
      cursor: "pointer" as const,
      fontWeight: 600,
    },
    editButton: {
      color: "#E8692C",
    },
    deleteButton: {
      color: "#dc2626",
    },
    modalOverlay: {
      position: "fixed" as const,
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    modalContent: {
      background: "#fff",
      padding: "24px",
      borderRadius: "12px",
      width: "600px",
    },
    modalSmall: {
      width: "450px",
    },
    input: {
      width: "100%",
      padding: "12px",
      marginBottom: "12px",
    },
    textarea: {
      width: "100%",
      padding: "12px",
      minHeight: "120px",
    },
    modalActions: {
      marginTop: "20px",
      display: "flex",
      justifyContent: "flex-end",
      gap: "10px",
    },
    deleteModalText: {
      marginTop: "12px",
      color: "#666",
    },
    deleteModalTitle: {
      fontWeight: 600,
      marginTop: "8px",
    },
    dangerButton: {
      background: "#dc2626",
      color: "#fff",
      border: "none",
      padding: "10px 18px",
      borderRadius: "8px",
      cursor: "pointer" as const,
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1>Marketing Center</h1>
          <p>Manage news, alerts and dashboard announcements.</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} style={styles.primaryButton}>
          + Create News
        </button>
      </div>

      {/* Table */}
      <div style={styles.tableWrapper}>
        {loading ? (
          <p>Loading marketing content...</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th align="left">Title</th>
                <th align="left">Type</th>
                <th align="left">Status</th>
                <th align="left">Sort Order</th>
                <th align="left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {marketing.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.type}</td>
                  <td>
                    <button
                      onClick={() => handleToggleStatus(item)}
                      style={styles.statusButton(item.isActive)}
                    >
                      {item.isActive ? "Published" : "Unpublished"}
                    </button>
                  </td>
                  <td>{item.sortOrder}</td>
                  <td style={{ display: "flex", gap: "12px" }}>
                    <button
                      onClick={() => openEditModal(item)}
                      style={{ ...styles.actionButton, ...styles.editButton }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteItem(item)}
                      style={{ ...styles.actionButton, ...styles.deleteButton }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {marketing.length === 0 && (
                <tr>
                  <td colSpan={5}>No marketing content found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2>Create Marketing Content</h2>
            <div style={{ marginTop: "16px" }}>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                style={styles.input}
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Body"
                style={styles.textarea}
              />
            </div>
            <div style={styles.modalActions}>
              <button onClick={closeCreateModal}>Cancel</button>
              <button onClick={handleCreate} style={styles.primaryButton}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2>Edit Marketing Content</h2>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              style={{ ...styles.input, marginTop: "12px" }}
            />
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              style={styles.textarea}
            />
            <div style={styles.modalActions}>
              <button onClick={closeEditModal}>Cancel</button>
              <button onClick={handleUpdate} style={styles.primaryButton}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteItem && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, ...styles.modalSmall }}>
            <h3>Delete Marketing Content</h3>
            <p style={styles.deleteModalText}>
              Are you sure you want to delete:
            </p>
            <p style={styles.deleteModalTitle}>{deleteItem.title}</p>
            <div style={styles.modalActions}>
              <button onClick={() => setDeleteItem(null)}>Cancel</button>
              <button onClick={handleDelete} style={styles.dangerButton}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}