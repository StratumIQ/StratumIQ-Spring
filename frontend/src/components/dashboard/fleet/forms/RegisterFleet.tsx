/**
 * RegisterFleet — StratumIQ
 * Path: frontend/src/components/dashboard/fleet/forms/RegisterFleet.tsx
 *
 * Multi-field registration form for a new fleet asset.
 * Field names match createEquipmentSchema in fleet.validation.js exactly.
 * Only name + category are required — all other fields are optional.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DASH, BRAND } from "@/lib/constants";
import { useRegisterEquipment } from "../hooks/useFleet";
import type { CreateEquipmentPayload, EquipmentCategory, EquipmentStatus } from "@/types/fleet";

// ── Field wrapper ──────────────────────────────────────────────
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

// ── Shared input style ────────────────────────────────────────
const IS = (focused: boolean): React.CSSProperties => ({
  width:        "100%",
  height:       40,
  padding:      "0 12px",
  borderRadius: 9,
  border:       `1.5px solid ${focused ? BRAND.orange : "var(--d-border)"}`,
  background:   DASH.surface,
  color:        DASH.text,
  fontSize:     13.5,
  fontFamily:   "inherit",
  outline:      "none",
  transition:   "border-color 0.15s",
  boxShadow:    focused ? "0 0 0 3px rgba(232,105,44,0.10)" : "none",
});

export default function RegisterFleet() {
  const router = useRouter();
  const { loading, mutate } = useRegisterEquipment();

  const [form, setForm] = useState<CreateEquipmentPayload>({
    name:          "",
    category:      "crusher",
    serial_number: "",
    brand:         "",
    model:         "",
    make_year:     undefined,
    status:        "active",
    running_hours: 0,
    location:      "",
    engine_type:   "",
    power_output:  "",
    capacity:      "",
    application:   "",
    attachments:   "",
    image_url:     "",
    document_url:  "",
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof CreateEquipmentPayload) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const val = e.target.value;
      setForm(prev => ({
        ...prev,
        [field]: field === "running_hours" || field === "make_year"
          ? val === "" ? undefined : Number(val)
          : val,
      }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Build clean payload — strip empty strings to undefined
    const payload: CreateEquipmentPayload = {
      name:     form.name.trim(),
      category: form.category,
      status:   form.status,
    };
    if (form.serial_number?.trim()) payload.serial_number = form.serial_number.trim();
    if (form.brand?.trim())         payload.brand         = form.brand.trim();
    if (form.model?.trim())         payload.model         = form.model.trim();
    if (form.make_year)             payload.make_year     = form.make_year;
    if (form.running_hours)         payload.running_hours = form.running_hours;
    if (form.location?.trim())      payload.location      = form.location.trim();
    if (form.engine_type?.trim())   payload.engine_type   = form.engine_type.trim();
    if (form.power_output?.trim())  payload.power_output  = form.power_output.trim();
    if (form.capacity?.trim())      payload.capacity      = form.capacity.trim();
    if (form.application?.trim())   payload.application   = form.application.trim();
    if (form.attachments?.trim())   payload.attachments   = form.attachments.trim();
    if (form.image_url?.trim())     payload.image_url     = form.image_url.trim();
    if (form.document_url?.trim())  payload.document_url  = form.document_url.trim();

    try {
      await mutate(payload, eq => router.push(`/dashboard/fleet/${eq.id}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  const f = (field: string) => ({
    style:   IS(focusedField === field),
    onFocus: () => setFocusedField(field),
    onBlur:  () => setFocusedField(null),
  });

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>

      {/* Back */}
      <button
        onClick={() => router.back()}
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: DASH.text3, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", marginBottom: 24, fontWeight: 500 }}
        onMouseOver={e => ((e.currentTarget as HTMLElement).style.color = BRAND.orange)}
        onMouseOut={e => ((e.currentTarget as HTMLElement).style.color = DASH.text3)}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round"/>
        </svg>
        Back to Fleet
      </button>

      <div style={{ background: DASH.surface, border: `1px solid ${DASH.border}`, borderRadius: 16, overflow: "hidden", boxShadow: DASH.shadowMd }}>

        {/* Header strip */}
        <div style={{ height: 4, background: `linear-gradient(90deg, ${BRAND.orange}, ${BRAND.orangeHover})` }} />

        <div style={{ padding: "28px 32px" }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: DASH.text, letterSpacing: "-0.03em", marginBottom: 4 }}>
              Register Equipment
            </h1>
            <p style={{ fontSize: 13, color: DASH.text3 }}>
              Only Name and Category are required. Fill the rest now or later.
            </p>
          </div>

          {error && (
            <div style={{ padding: "10px 14px", background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 9, fontSize: 13, color: "#DC2626", marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 0 }}>

            {/* ── Section: Identity ── */}
            <SectionHeader>Identity</SectionHeader>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              <Field label="Equipment Name" required>
                <input value={form.name} onChange={set("name")} placeholder="e.g. Crusher A1" required {...f("name")} />
              </Field>

              <Field label="Category" required>
                <select value={form.category} onChange={set("category")} {...f("category")}>
                  <option value="crusher">Crusher</option>
                  <option value="screener">Screener</option>
                  <option value="conveyor">Conveyor</option>
                  <option value="mobile_plant">Mobile Plant</option>
                  <option value="other">Other</option>
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

            {/* ── Section: Operational State ── */}
            <SectionHeader>Operational State</SectionHeader>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
              <Field label="Initial Status">
                <select value={form.status} onChange={set("status")} {...f("status")}>
                  <option value="active">Active</option>
                  <option value="idle">Idle</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="retired">Retired</option>
                </select>
              </Field>

              <Field label="Running Hours" hint="Current odometer reading">
                <input type="number" value={form.running_hours ?? 0} onChange={set("running_hours")} min={0} max={999999} {...f("running_hours")} />
              </Field>

              <Field label="Location">
                <input value={form.location ?? ""} onChange={set("location")} placeholder="e.g. Site A, Bangalore" {...f("location")} />
              </Field>
            </div>

            {/* ── Section: Technical / Product Specs ── */}
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

            {/* ── Section: Media ── */}
            <SectionHeader>Media & Documents</SectionHeader>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 28 }}>
              <Field label="Image URL" hint="Direct link to equipment photo">
                <input type="url" value={form.image_url ?? ""} onChange={set("image_url")} placeholder="https://…" {...f("image_url")} />
              </Field>

              <Field label="Document URL" hint="Manual or service guide link">
                <input type="url" value={form.document_url ?? ""} onChange={set("document_url")} placeholder="https://…" {...f("document_url")} />
              </Field>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button type="button" className="btn-secondary" onClick={() => router.back()}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <svg style={{ animation: "spin 1s linear infinite" }} width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                      <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    Registering…
                  </>
                ) : "Register Equipment"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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