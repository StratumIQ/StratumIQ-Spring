"use client";

/**
 * OperationalTab — StratumIQ
 * Layer D: Logistics & Installation, Certifications & Compliance, Environmental Profile.
 *
 * FIELD NAME ALIGNMENT (frontend → backend DB columns):
 *   compliance_certification: id (NOT cert_id) — DB primary key
 *   logistics_installation:   all field names match backend exactly
 *   environmental:            all field names match backend exactly
 *
 * VALIDATION RULES (matched to equipment_validation.js):
 *   logistics:
 *     shipping_mode: enum road/rail/sea/air/multimodal
 *     crane_capacity_required_t: positive number
 *     installation_days: positive integer
 *     commissioning_days: positive integer
 *     foundation_type: max 50 chars
 *     notes: max 2000 chars
 *   certification:
 *     standard_name: required, max 100 chars
 *     certification_body: max 150 chars
 *     certificate_number: max 100 chars
 *     valid_from/valid_until: ISO date strings
 *     region: max 100 chars
 *     document_url: valid URI
 *   environmental:
 *     noise_level_db: positive number
 *     fuel_consumption_lph: positive number
 *     co2_emission_gkwh: positive number
 *     water_usage_lph: positive number
 *     recyclable_parts_pct: 0–100
 *     notes: max 2000 chars
 */

import { useState } from "react";
import { DASH } from "@/lib/constants";
import { equipmentAPI } from "../api/equipment.api";
import { useMutation } from "../hooks/useEquipment";
import {
  Field, Input, Select, Textarea, Toggle, SaveBtn,
  SectionCard, FormGrid, FormRow, DataTable, IconBtn, useToast,
} from "../shared/EqUI";
import type { EquipmentSpec, Certification } from "@/types/equipment";

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: Logistics & Installation
// ─────────────────────────────────────────────────────────────────────────────

interface LogisticsErrors {
  crane_capacity_required_t?: string;
  installation_days?: string;
  commissioning_days?: string;
  foundation_type?: string;
  notes?: string;
}

function LogisticsSection({ spec, onSaved }: { spec: EquipmentSpec; onSaved: () => void }) {
  const { show, ToastEl } = useToast();
  const { mutate, loading } = useMutation(equipmentAPI.operational.upsertLogistics);
  const id = spec.identity.equipment_id;
  const lg = spec.operational?.logistics ?? {};
  const [errors, setErrors] = useState<LogisticsErrors>({});

  const [form, setForm] = useState({
    shipping_mode:             lg.shipping_mode            ?? "",
    requires_special_permit:   lg.requires_special_permit ?? false,
    crane_capacity_required_t: String(lg.crane_capacity_required_t ?? ""),
    installation_days:         String(lg.installation_days         ?? ""),
    commissioning_days:        String(lg.commissioning_days        ?? ""),
    foundation_required:       lg.foundation_required      ?? false,
    foundation_type:           lg.foundation_type          ?? "",
    notes:                     lg.notes                    ?? "",
  });

  const n = (v: string) => v.trim() !== "" ? Number(v) : undefined;

  const set = (k: string) => (v: string | boolean) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k as keyof LogisticsErrors]) setErrors(prev => ({ ...prev, [k]: undefined }));
  };

  const validate = (): boolean => {
    const e: LogisticsErrors = {};
    if (form.crane_capacity_required_t.trim()) {
      const v = Number(form.crane_capacity_required_t);
      if (isNaN(v) || v <= 0) e.crane_capacity_required_t = "Crane capacity must be a positive number";
    }
    if (form.installation_days.trim()) {
      const v = Number(form.installation_days);
      if (isNaN(v) || v <= 0 || !Number.isInteger(v)) e.installation_days = "Installation days must be a positive integer";
    }
    if (form.commissioning_days.trim()) {
      const v = Number(form.commissioning_days);
      if (isNaN(v) || v <= 0 || !Number.isInteger(v)) e.commissioning_days = "Commissioning days must be a positive integer";
    }
    if (form.foundation_type.trim().length > 50) e.foundation_type = "Foundation type must be ≤ 50 characters";
    if (form.notes.trim().length > 2000) e.notes = "Notes must be ≤ 2,000 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) { show("Fix the errors above before saving", "error"); return; }

    const payload: Record<string, unknown> = {
      requires_special_permit: form.requires_special_permit,
      foundation_required:     form.foundation_required,
    };
    if (form.shipping_mode)                    payload.shipping_mode             = form.shipping_mode;
    if (form.crane_capacity_required_t.trim()) payload.crane_capacity_required_t = n(form.crane_capacity_required_t);
    if (form.installation_days.trim())         payload.installation_days         = n(form.installation_days);
    if (form.commissioning_days.trim())        payload.commissioning_days        = n(form.commissioning_days);
    if (form.foundation_type.trim())           payload.foundation_type           = form.foundation_type.trim();
    if (form.notes.trim())                     payload.notes                     = form.notes.trim();

    try {
      await mutate(id, payload as never);
      show("Logistics information saved!", "success");
      onSaved();
    } catch (err) {
      show(err instanceof Error ? err.message : "Failed to save logistics", "error");
    }
  };

  return (
    <>
      {ToastEl}
      <SectionCard title="Logistics & Installation" subtitle="Shipping, foundation and commissioning requirements">
        <FormGrid cols={3}>
          <Field label="Shipping Mode" hint="Preferred method of transport">
            <Select value={form.shipping_mode} onChange={set("shipping_mode") as (v: string) => void}
              placeholder="Select…"
              options={[
                { value: "road",       label: "Road" },
                { value: "rail",       label: "Rail" },
                { value: "sea",        label: "Sea" },
                { value: "air",        label: "Air" },
                { value: "multimodal", label: "Multimodal" },
              ]} />
          </Field>
          <Field label="Crane Capacity Required (t)" hint="Minimum crane lift capacity needed" error={errors.crane_capacity_required_t}>
            <Input type="number" value={form.crane_capacity_required_t}
              onChange={set("crane_capacity_required_t") as (v: string) => void}
              placeholder="e.g. 80" error={errors.crane_capacity_required_t} />
          </Field>
          <Field label="Foundation Type" hint="Max 50 characters" error={errors.foundation_type}>
            <Input value={form.foundation_type}
              onChange={set("foundation_type") as (v: string) => void}
              placeholder="e.g. Concrete pad" error={errors.foundation_type} />
          </Field>
          <Field label="Installation (days)" hint="Positive integer — days to install" error={errors.installation_days}>
            <Input type="number" value={form.installation_days}
              onChange={set("installation_days") as (v: string) => void}
              placeholder="e.g. 14" error={errors.installation_days} />
          </Field>
          <Field label="Commissioning (days)" hint="Positive integer — days to commission" error={errors.commissioning_days}>
            <Input type="number" value={form.commissioning_days}
              onChange={set("commissioning_days") as (v: string) => void}
              placeholder="e.g. 5" error={errors.commissioning_days} />
          </Field>
          <FormRow>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <Toggle checked={form.requires_special_permit} onChange={set("requires_special_permit") as (v: boolean) => void} label="Requires Special Permit" />
              <Toggle checked={form.foundation_required}     onChange={set("foundation_required") as (v: boolean) => void}     label="Foundation Required" />
            </div>
          </FormRow>
          <FormRow>
            <Field label="Notes" hint="Max 2,000 characters" error={errors.notes}>
              <Textarea value={form.notes} onChange={set("notes") as (v: string) => void}
                placeholder="Additional logistics notes…" rows={3} />
            </Field>
          </FormRow>
        </FormGrid>
        <SaveBtn loading={loading} onClick={handleSave} label="Save Logistics" />
      </SectionCard>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: Certifications & Compliance
// Backend schema: standard_name (req, max 100), certification_body (max 150),
//   certificate_number (max 100), valid_from/valid_until (ISO date),
//   region (max 100), document_url (valid URI)
// DB PK: id (NOT cert_id)
// ─────────────────────────────────────────────────────────────────────────────

const CERT_COLS = [
  { key: "standard_name",      label: "Standard" },
  { key: "certification_body", label: "Body" },
  { key: "region",             label: "Region" },
  { key: "valid_until",        label: "Valid Until" },
  { key: "_actions",           label: "", width: 60 },
];

interface CertificationErrors {
  standard_name?: string;
  certification_body?: string;
  certificate_number?: string;
  valid_from?: string;
  valid_until?: string;
  region?: string;
  document_url?: string;
}

function CertificationsSection({ spec, onSaved }: { spec: EquipmentSpec; onSaved: () => void }) {
  const { show, ToastEl } = useToast();
  const id = spec.identity.equipment_id;
  const [certs, setCerts] = useState<Certification[]>(spec.operational?.certifications ?? []);
  const [adding, setAdding] = useState(false);
  const [errors, setErrors] = useState<CertificationErrors>({});
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    standard_name: "", certification_body: "", certificate_number: "",
    valid_from: "", valid_until: "", region: "", document_url: "",
  });

  const set = (k: string) => (v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k as keyof CertificationErrors]) setErrors(prev => ({ ...prev, [k]: undefined }));
  };

  const isValidUrl = (url: string) => { try { new URL(url); return true; } catch { return false; } };

  const validate = (): boolean => {
    const e: CertificationErrors = {};
    if (!form.standard_name.trim()) {
      e.standard_name = "Standard name is required";
    } else if (form.standard_name.trim().length > 100) {
      e.standard_name = "Standard name must be ≤ 100 characters";
    }
    if (form.certification_body.trim().length > 150) e.certification_body = "Certification body must be ≤ 150 characters";
    if (form.certificate_number.trim().length > 100) e.certificate_number  = "Certificate number must be ≤ 100 characters";
    if (form.region.trim().length > 100)             e.region              = "Region must be ≤ 100 characters";
    if (form.document_url.trim() && !isValidUrl(form.document_url.trim())) {
      e.document_url = "Must be a valid URL starting with https://";
    }
    if (form.valid_from && form.valid_until) {
      if (new Date(form.valid_from) > new Date(form.valid_until))
        e.valid_until = "Valid until must be after valid from";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = async () => {
    if (!validate()) { show("Fix the errors above before adding", "error"); return; }
    setSaving(true);
    try {
      const res = await equipmentAPI.operational.addCertification(id, {
        standard_name:      form.standard_name.trim(),
        certification_body: form.certification_body.trim() || undefined,
        certificate_number: form.certificate_number.trim() || undefined,
        valid_from:         form.valid_from  || undefined,
        valid_until:        form.valid_until || undefined,
        region:             form.region.trim()       || undefined,
        document_url:       form.document_url.trim() || undefined,
      } as never);
      setCerts(c => [...c, res.cert]);
      setForm({ standard_name: "", certification_body: "", certificate_number: "", valid_from: "", valid_until: "", region: "", document_url: "" });
      setAdding(false);
      setErrors({});
      show(`"${form.standard_name}" added!`, "success");
      onSaved();
    } catch (err) {
      show(err instanceof Error ? err.message : "Failed to add certification", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (certId: number, standardName: string) => {
    if (!confirm(`Delete certification "${standardName}"?`)) return;
    try {
      await equipmentAPI.operational.deleteCertification(id, certId);
      setCerts(c => c.filter(x => x.id !== certId));   // ← use .id not .cert_id
      show(`"${standardName}" deleted`, "success");
      onSaved();
    } catch (err) {
      show(err instanceof Error ? err.message : "Failed to delete certification", "error");
    }
  };

  const rows = certs.map(c => ({
    standard_name:      <span style={{ fontWeight: 600 }}>{c.standard_name}</span>,
    certification_body: c.certification_body ?? "—",
    region:             c.region             ?? "—",
    valid_until:        c.valid_until ? new Date(c.valid_until).toLocaleDateString() : "—",
    _actions: (
      <IconBtn onClick={() => handleDelete(c.id, c.standard_name)} danger title="Delete certification">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
        </svg>
      </IconBtn>
    ),
  }));

  return (
    <>
      {ToastEl}
      <SectionCard
        title="Certifications & Compliance"
        subtitle="Standards, regulatory approvals and certificates"
        action={
          <button onClick={() => { setAdding(a => !a); setErrors({}); }}
            className="btn-secondary" style={{ height: 30, padding: "0 12px", fontSize: 12 }}>
            {adding ? "Cancel" : "+ Add Cert"}
          </button>
        }
      >
        {adding && (
          <div style={{ background: DASH.surface2, borderRadius: 10, padding: 14, marginBottom: 14, border: `1px solid ${DASH.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: DASH.text }}>New Certification</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px 12px", marginBottom: 10 }}>
              <Field label="Standard Name" required error={errors.standard_name}>
                <Input value={form.standard_name} onChange={set("standard_name")}
                  placeholder="e.g. CE, ISO 9001, BIS" error={errors.standard_name} />
              </Field>
              <Field label="Certification Body" hint="Max 150 chars" error={errors.certification_body}>
                <Input value={form.certification_body} onChange={set("certification_body")}
                  placeholder="e.g. TÜV, BIS, CE Authority" error={errors.certification_body} />
              </Field>
              <Field label="Certificate Number" hint="Max 100 chars" error={errors.certificate_number}>
                <Input value={form.certificate_number} onChange={set("certificate_number")}
                  placeholder="Certificate reference number" error={errors.certificate_number} />
              </Field>
              <Field label="Valid From">
                <Input type="date" value={form.valid_from} onChange={set("valid_from")} />
              </Field>
              <Field label="Valid Until" error={errors.valid_until}>
                <Input type="date" value={form.valid_until} onChange={set("valid_until")} error={errors.valid_until} />
              </Field>
              <Field label="Region" hint="Max 100 chars" error={errors.region}>
                <Input value={form.region} onChange={set("region")}
                  placeholder="e.g. EU, India, Global" error={errors.region} />
              </Field>
              <div style={{ gridColumn: "1/-1" }}>
                <Field label="Document URL" hint="Must be a valid https:// URL" error={errors.document_url}>
                  <Input value={form.document_url} onChange={set("document_url")}
                    placeholder="https://certificates.example.com/cert.pdf" error={errors.document_url} />
                </Field>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => { setAdding(false); setErrors({}); setForm({ standard_name: "", certification_body: "", certificate_number: "", valid_from: "", valid_until: "", region: "", document_url: "" }); }}
                className="btn-secondary" style={{ height: 32, padding: "0 14px", fontSize: 12 }}>Cancel</button>
              <button onClick={handleAdd} className="btn-primary" style={{ height: 32, padding: "0 14px", fontSize: 12 }} disabled={saving}>
                {saving ? "Adding…" : "Add Certification"}
              </button>
            </div>
          </div>
        )}
        <DataTable columns={CERT_COLS} rows={rows} emptyText="No certifications yet. Click '+ Add Cert' to add one." />
      </SectionCard>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: Environmental Profile
// Backend schema: noise_level_db (positive), dust_emission_class (max 30),
//   fuel_consumption_lph (positive), co2_emission_gkwh (positive),
//   vibration_class (max 30), water_usage_lph (positive),
//   recyclable_parts_pct (0–100), notes (max 2000)
// ─────────────────────────────────────────────────────────────────────────────

interface EnvironmentalErrors {
  noise_level_db?: string;
  dust_emission_class?: string;
  fuel_consumption_lph?: string;
  co2_emission_gkwh?: string;
  vibration_class?: string;
  water_usage_lph?: string;
  recyclable_parts_pct?: string;
  notes?: string;
}

function EnvironmentalSection({ spec, onSaved }: { spec: EquipmentSpec; onSaved: () => void }) {
  const { show, ToastEl } = useToast();
  const { mutate, loading } = useMutation(equipmentAPI.operational.upsertEnvironmental);
  const id = spec.identity.equipment_id;
  const ev = spec.operational?.environmental ?? {};
  const [errors, setErrors] = useState<EnvironmentalErrors>({});

  const [form, setForm] = useState({
    noise_level_db:       String(ev.noise_level_db       ?? ""),
    dust_emission_class:  ev.dust_emission_class          ?? "",
    fuel_consumption_lph: String(ev.fuel_consumption_lph ?? ""),
    co2_emission_gkwh:    String(ev.co2_emission_gkwh    ?? ""),
    vibration_class:      ev.vibration_class              ?? "",
    water_usage_lph:      String(ev.water_usage_lph       ?? ""),
    recyclable_parts_pct: String(ev.recyclable_parts_pct  ?? ""),
    notes:                ev.notes                        ?? "",
  });

  const n = (v: string) => v.trim() !== "" ? Number(v) : undefined;

  const set = (k: string) => (v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k as keyof EnvironmentalErrors]) setErrors(prev => ({ ...prev, [k]: undefined }));
  };

  const validate = (): boolean => {
    const e: EnvironmentalErrors = {};
    const pos = (v: string, f: keyof EnvironmentalErrors, label: string) => {
      if (!v.trim()) return;
      const num = Number(v);
      if (isNaN(num) || num <= 0) e[f] = `${label} must be a positive number`;
    };
    pos(form.noise_level_db,       "noise_level_db",       "Noise level (dB)");
    pos(form.fuel_consumption_lph,  "fuel_consumption_lph", "Fuel consumption (L/h)");
    pos(form.co2_emission_gkwh,     "co2_emission_gkwh",    "CO₂ emission (g/kWh)");
    pos(form.water_usage_lph,       "water_usage_lph",      "Water usage (L/h)");

    if (form.recyclable_parts_pct.trim()) {
      const v = Number(form.recyclable_parts_pct);
      if (isNaN(v) || v < 0 || v > 100) e.recyclable_parts_pct = "Recyclable parts must be between 0 and 100%";
    }
    if (form.dust_emission_class.trim().length > 30)  e.dust_emission_class = "Dust class must be ≤ 30 characters";
    if (form.vibration_class.trim().length > 30)      e.vibration_class     = "Vibration class must be ≤ 30 characters";
    if (form.notes.trim().length > 2000)              e.notes               = "Notes must be ≤ 2,000 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) { show("Fix the errors above before saving", "error"); return; }

    const payload: Record<string, unknown> = {};
    if (form.noise_level_db.trim())       payload.noise_level_db       = n(form.noise_level_db);
    if (form.dust_emission_class.trim())  payload.dust_emission_class  = form.dust_emission_class.trim();
    if (form.fuel_consumption_lph.trim()) payload.fuel_consumption_lph = n(form.fuel_consumption_lph);
    if (form.co2_emission_gkwh.trim())    payload.co2_emission_gkwh    = n(form.co2_emission_gkwh);
    if (form.vibration_class.trim())      payload.vibration_class      = form.vibration_class.trim();
    if (form.water_usage_lph.trim())      payload.water_usage_lph      = n(form.water_usage_lph);
    if (form.recyclable_parts_pct.trim()) payload.recyclable_parts_pct = n(form.recyclable_parts_pct);
    if (form.notes.trim())                payload.notes                = form.notes.trim();

    if (Object.keys(payload).length === 0) { show("No changes to save", "info"); return; }

    try {
      await mutate(id, payload as never);
      show("Environmental data saved!", "success");
      onSaved();
    } catch (err) {
      show(err instanceof Error ? err.message : "Failed to save environmental data", "error");
    }
  };

  return (
    <>
      {ToastEl}
      <SectionCard title="Environmental Profile" subtitle="Emissions, noise and sustainability data">
        <FormGrid cols={3}>
          <Field label="Noise Level (dB)" hint="Positive number" error={errors.noise_level_db}>
            <Input type="number" value={form.noise_level_db} onChange={set("noise_level_db")} placeholder="e.g. 115" error={errors.noise_level_db} />
          </Field>
          <Field label="Dust Emission Class" hint="Max 30 characters" error={errors.dust_emission_class}>
            <Input value={form.dust_emission_class} onChange={set("dust_emission_class")} placeholder="e.g. Class III" error={errors.dust_emission_class} />
          </Field>
          <Field label="Fuel Consumption (L/h)" hint="Positive number" error={errors.fuel_consumption_lph}>
            <Input type="number" value={form.fuel_consumption_lph} onChange={set("fuel_consumption_lph")} placeholder="e.g. 28" error={errors.fuel_consumption_lph} />
          </Field>
          <Field label="CO₂ Emission (g/kWh)" hint="Positive number" error={errors.co2_emission_gkwh}>
            <Input type="number" value={form.co2_emission_gkwh} onChange={set("co2_emission_gkwh")} placeholder="e.g. 220" error={errors.co2_emission_gkwh} />
          </Field>
          <Field label="Vibration Class" hint="Max 30 characters" error={errors.vibration_class}>
            <Input value={form.vibration_class} onChange={set("vibration_class")} placeholder="e.g. Class B" error={errors.vibration_class} />
          </Field>
          <Field label="Water Usage (L/h)" hint="Positive number" error={errors.water_usage_lph}>
            <Input type="number" value={form.water_usage_lph} onChange={set("water_usage_lph")} placeholder="e.g. 5" error={errors.water_usage_lph} />
          </Field>
          <Field label="Recyclable Parts (%)" hint="0–100" error={errors.recyclable_parts_pct}>
            <Input type="number" value={form.recyclable_parts_pct} onChange={set("recyclable_parts_pct")} placeholder="e.g. 85" error={errors.recyclable_parts_pct} />
          </Field>
          <FormRow>
            <Field label="Notes" hint="Max 2,000 characters" error={errors.notes}>
              <Textarea value={form.notes} onChange={set("notes")} placeholder="Environmental notes…" rows={3} />
            </Field>
          </FormRow>
        </FormGrid>
        <SaveBtn loading={loading} onClick={handleSave} label="Save Environmental Data" />
      </SectionCard>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Operational Tab
// ─────────────────────────────────────────────────────────────────────────────

export default function OperationalTab({ spec, onRefresh }: { spec: EquipmentSpec; onRefresh: () => void }) {
  return (
    <div>
      <LogisticsSection      spec={spec} onSaved={onRefresh} />
      <CertificationsSection spec={spec} onSaved={onRefresh} />
      <EnvironmentalSection  spec={spec} onSaved={onRefresh} />
    </div>
  );
}