/**
 * EditFleet — StratumIQ
 * Path: frontend/src/components/dashboard/fleet/forms/EditFleet.tsx
 *
 * Edit existing equipment — matches updateEquipmentSchema validation.
 * All fields optional, only sends changed fields.
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { DASH, BRAND } from "@/lib/constants";
import PageShell from "../../layout/PageShell";
import GlassCard from "../../ui/GlassCard";
import Button from "../../ui/Button";
import ImageUpload from "../../ui/ImageUpload";
import Skeleton from "../../ui/Skeleton";
import EmptyState from "../../ui/EmptyState";
import { useEquipmentDetail, useUpdateEquipment } from "../hooks/useFleet";
import { notify } from "@/lib/toast";
import type { CreateEquipmentPayload } from "@/types/fleet";

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12.5, fontWeight: 600, color: DASH.text2 }}>
        {label}
        {required && <span style={{ color: BRAND.orange, marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {hint && <span style={{ fontSize: 11, color: DASH.text3 }}>{hint}</span>}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: DASH.text3, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10, paddingBottom: 6, borderBottom: `1px solid ${DASH.border}` }}>
      {children}
    </div>
  );
}

const IS = (focused: boolean): React.CSSProperties => ({
  width: "100%",
  height: 40,
  padding: "0 12px",
  borderRadius: 9,
  border: `1.5px solid ${focused ? BRAND.orange : "var(--d-border)"}`,
  background: DASH.surface,
  color: DASH.text,
  fontSize: 13.5,
  fontFamily: "inherit",
  outline: "none",
  transition: "border-color 0.15s",
  boxShadow: focused ? "0 0 0 3px rgba(232,105,44,0.10)" : "none",
});

export default function EditFleet({ id }: { id: number }) {
  const router = useRouter();
  const { equipment, loading, error: fetchError } = useEquipmentDetail(id);
  const { loading: saving, mutate: updateEquipment } = useUpdateEquipment();

  const [form, setForm] = useState<Partial<CreateEquipmentPayload>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Populate form when equipment loads
  useEffect(() => {
    if (equipment) {
      setForm({
        name:          equipment.name,
        category:      equipment.category,
        serial_number: equipment.serial_number ?? undefined,
        brand:         equipment.brand ?? undefined,
        model:         equipment.model ?? undefined,
        make_year:     equipment.make_year ?? undefined,
        status:        equipment.status,
        running_hours: parseFloat(equipment.running_hours),
        location:      equipment.location ?? undefined,
        engine_type:   equipment.engine_type ?? undefined,
        power_output:  equipment.power_output ?? undefined,
        capacity:      equipment.capacity ?? undefined,
        application:   equipment.application ?? undefined,
        attachments:   equipment.attachments ?? undefined,
        image_url:     equipment.image_url ?? undefined,
        document_url:  equipment.document_url ?? undefined,
      });
    }
  }, [equipment]);

  const set = (field: keyof CreateEquipmentPayload) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const val = e.target.value;
      setForm(prev => ({
        ...prev,
        [field]: field === "running_hours" || field === "make_year"
          ? val === "" ? undefined : Number(val)
          : val,
      }));
    };

  // Build payload with only changed fields
  const buildPayload = (): Partial<CreateEquipmentPayload> => {
    if (!equipment) return {};
    const payload: Partial<CreateEquipmentPayload> = {};

    const changedFields: (keyof CreateEquipmentPayload)[] = [
      "name", "category", "serial_number", "brand", "model", "make_year",
      "status", "running_hours", "location", "engine_type", "power_output",
      "capacity", "application", "attachments", "image_url", "document_url"
    ];

    for (const field of changedFields) {
      const current = form[field];
      let original: unknown;

      if (field === "running_hours") {
        original = parseFloat(equipment.running_hours);
      } else if (field === "make_year") {
        original = equipment.make_year;
      } else {
        original = equipment[field as keyof typeof equipment];
      }

      if (current !== undefined && current !== null && current !== original) {
        (payload as Record<string, unknown>)[field] = current;
      }
    }
    return payload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const payload = buildPayload();
    if (Object.keys(payload).length === 0) {
      router.back();
      return;
    }

    try {
      await updateEquipment(id, payload, () => {
        notify.success("Fleet updated successfully");
        router.push(`/dashboard/fleet/${id}`);
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to save fleet";
      setSubmitError(msg);
      notify.error(msg);
    }
  };

  const f = (field: string) => ({
    style:   IS(focusedField === field),
    onFocus: () => setFocusedField(field),
    onBlur:  () => setFocusedField(null),
  });

  if (loading) {
    return (
      <PageShell breadcrumbs={[{ label: "Fleet", href: "/dashboard/fleet" }]} maxWidth={720}>
        <Skeleton height={400} className="d-skeleton-block" />
      </PageShell>
    );
  }

  if (fetchError || !equipment) {
    return (
      <PageShell breadcrumbs={[{ label: "Fleet", href: "/dashboard/fleet" }]} maxWidth={720}>
        <EmptyState
          icon={Search}
          title="Asset not found"
          description={fetchError || "This fleet asset does not exist or you do not have access."}
          action={{ label: "Back to Fleet", href: "/dashboard/fleet" }}
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title={`Edit ${equipment.name}`}
      description="Update asset details and operational metadata"
      breadcrumbs={[
        { label: "Fleet", href: "/dashboard/fleet" },
        { label: equipment.name, href: `/dashboard/fleet/${id}` },
        { label: "Edit" },
      ]}
      maxWidth={720}
      footer={
        <>
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" form="edit-fleet-form" loading={saving}>Save Changes</Button>
        </>
      }
    >
      <GlassCard padding="lg" className="d-form-card">
        {submitError && (
          <div className="d-alert d-alert-red d-mt-sm" style={{ marginBottom: 20 }}>
            {submitError}
          </div>
        )}

        <form id="edit-fleet-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 0 }}>

          {/* ── Identity ── */}
          <SectionHeader>Identity</SectionHeader>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
            <Field label="Equipment Name">
              <input value={form.name ?? ""} onChange={set("name")} placeholder="e.g. Crusher A1" {...f("name")} />
            </Field>
            <Field label="Category">
              <select value={form.category ?? "CRUSHER"} onChange={set("category")} {...f("category")}>
                <option value="CRUSHER">Crusher</option>
                <option value="SCREENER">Screener</option>
                <option value="CONVEYOR">Conveyor</option>
                <option value="MOBILE_PLANT">Mobile Plant</option>
                <option value="OTHER">Other</option>
              </select>
            </Field>
            <Field label="Brand">
              <input value={form.brand ?? ""} onChange={set("brand")} placeholder="e.g. Terex" {...f("brand")} />
            </Field>
            <Field label="Model">
              <input value={form.model ?? ""} onChange={set("model")} placeholder="e.g. Powerscreen XA400S" {...f("model")} />
            </Field>
            <Field label="Serial Number">
              <input value={form.serial_number ?? ""} onChange={set("serial_number")} placeholder="e.g. PSX40012345" {...f("serial_number")} />
            </Field>
            <Field label="Make Year">
              <input type="number" value={form.make_year ?? ""} onChange={set("make_year")} placeholder="e.g. 2022" min={1950} max={new Date().getFullYear() + 1} {...f("make_year")} />
            </Field>
          </div>

          {/* ── Operational State ── */}
          <SectionHeader>Operational State</SectionHeader>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
            <Field label="Status">
              <select value={form.status ?? "ACTIVE"} onChange={set("status")} {...f("status")}>
                <option value="ACTIVE">Active</option>
                <option value="IDLE">Idle</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="RETIRED">Retired</option>
              </select>
            </Field>
            <Field label="Running Hours" hint="Current odometer reading">
              <input type="number" value={form.running_hours ?? 0} onChange={set("running_hours")} min={0} max={999999} {...f("running_hours")} />
            </Field>
            <Field label="Location">
              <input value={form.location ?? ""} onChange={set("location")} placeholder="e.g. Site A, Bangalore" {...f("location")} />
            </Field>
          </div>

          {/* ── Technical Specifications ── */}
          <SectionHeader>Technical Specifications</SectionHeader>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
            <Field label="Engine Type">
              <input value={form.engine_type ?? ""} onChange={set("engine_type")} placeholder="e.g. CAT C9 Tier 3" {...f("engine_type")} />
            </Field>
            <Field label="Power Output">
              <input value={form.power_output ?? ""} onChange={set("power_output")} placeholder="e.g. 350 HP" {...f("power_output")} />
            </Field>
            <Field label="Capacity">
              <input value={form.capacity ?? ""} onChange={set("capacity")} placeholder="e.g. 400 TPH" {...f("capacity")} />
            </Field>
            <Field label="Application">
              <input value={form.application ?? ""} onChange={set("application")} placeholder="e.g. Quarry / Recycling" {...f("application")} />
            </Field>
            <Field label="Attachments" hint="Comma-separated list">
              <input value={form.attachments ?? ""} onChange={set("attachments")} placeholder="e.g. Magnet, Dust suppressor" {...f("attachments")} />
            </Field>
          </div>

          {/* ── Media & Documents ── */}
          <SectionHeader>Media & Documents</SectionHeader>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 28 }}>
            <Field label="Equipment Photo" hint="Upload a photo of the asset">
              <ImageUpload
                value={form.image_url}
                onChange={(url) => setForm((prev) => ({ ...prev, image_url: url ?? undefined }))}
              />
            </Field>
            <Field label="Document URL" hint="Optional link to manual or service guide">
              <input type="url" value={form.document_url ?? ""} onChange={set("document_url")} placeholder="https://…" {...f("document_url")} />
            </Field>
          </div>

        </form>
      </GlassCard>
    </PageShell>
  );
}