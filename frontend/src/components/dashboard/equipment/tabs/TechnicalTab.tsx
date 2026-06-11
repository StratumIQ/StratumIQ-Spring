import { useState } from "react";
import { DASH } from "@/lib/constants";
import { equipmentAPI } from "../api/equipment.api";
import { useMutation } from "../hooks/useEquipment";
import {
  Field, Input, Select, Textarea, SaveBtn, SectionCard, FormGrid,
  DataTable, IconBtn, useToast,
} from "../shared/EqUI";
import type { EquipmentSpec, WearPart, MaintenanceTask, PerformanceRow } from "@/types/equipment";

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: Technical Master
// ─────────────────────────────────────────────────────────────────────────────

interface TechnicalMasterErrors {
  weight_kg?: string;
  power_kw?: string;
  fuel_efficiency_lph?: string;
  max_feed_size_mm?: string;
  capacity_tph_min?: string;
  capacity_tph_max?: string;
  operating_cost_per_ton?: string;
  wear_cost_per_ton?: string;
}

function TechnicalMasterSection({ spec, onSaved }: { spec: EquipmentSpec; onSaved: () => void }) {
  const { show, ToastEl } = useToast();
  const { mutate, loading } = useMutation(equipmentAPI.technical.upsertMaster);
  const id = spec.identity.equipment_id;
  const initial = spec.technical?.master ?? {};
  const [errors, setErrors] = useState<TechnicalMasterErrors>({});

  const [form, setForm] = useState({
    weight_kg:              String(initial.weight_kg ?? ""),
    power_kw:               String(initial.power_kw ?? ""),
    drive_type:             initial.drive_type ?? "",
    engine_model:           initial.engine_model ?? "",
    fuel_efficiency_lph:    String(initial.fuel_efficiency_lph ?? ""),
    max_feed_size_mm:       String(initial.max_feed_size_mm ?? ""),
    capacity_tph_min:       String(initial.capacity_tph_min ?? ""),
    capacity_tph_max:       String(initial.capacity_tph_max ?? ""),
    operating_cost_per_ton: String(initial.operating_cost_per_ton ?? ""),
    wear_cost_per_ton:      String(initial.wear_cost_per_ton ?? ""),
  });

  const n = (v: string) => v.trim() !== "" ? Number(v) : undefined;

  const set = (k: string) => (v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k as keyof TechnicalMasterErrors]) {
      setErrors(prev => ({ ...prev, [k]: undefined }));
    }
  };

  const validate = (): boolean => {
    const e: TechnicalMasterErrors = {};
    const pos = (v: string, field: keyof TechnicalMasterErrors, max: number, label: string) => {
      if (v.trim() === "") return;
      const num = Number(v);
      if (isNaN(num) || num <= 0 || num > max)
        e[field] = `${label} must be a positive number ≤ ${max.toLocaleString()}`;
    };
    pos(form.weight_kg,              "weight_kg",              500_000, "Weight (kg)");
    pos(form.power_kw,               "power_kw",               5_000,   "Power (kW)");
    pos(form.fuel_efficiency_lph,    "fuel_efficiency_lph",    500,     "Fuel efficiency (L/h)");
    pos(form.max_feed_size_mm,       "max_feed_size_mm",       3_000,   "Max feed size (mm)");
    pos(form.capacity_tph_min,       "capacity_tph_min",       10_000,  "Min capacity (tph)");
    pos(form.capacity_tph_max,       "capacity_tph_max",       10_000,  "Max capacity (tph)");
    pos(form.operating_cost_per_ton, "operating_cost_per_ton", 1_000,   "Operating cost ($/t)");
    pos(form.wear_cost_per_ton,      "wear_cost_per_ton",      500,     "Wear cost ($/t)");

    // Cross-field: min ≤ max
    if (form.capacity_tph_min && form.capacity_tph_max) {
      if (Number(form.capacity_tph_min) > Number(form.capacity_tph_max))
        e.capacity_tph_min = "Min capacity cannot exceed max capacity";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) { show("Fix the errors above before saving", "error"); return; }
    const payload: Record<string, unknown> = {};
    if (form.weight_kg.trim())              payload.weight_kg              = n(form.weight_kg);
    if (form.power_kw.trim())               payload.power_kw               = n(form.power_kw);
    if (form.drive_type)                    payload.drive_type             = form.drive_type;
    if (form.engine_model.trim())           payload.engine_model           = form.engine_model.trim();
    if (form.fuel_efficiency_lph.trim())    payload.fuel_efficiency_lph    = n(form.fuel_efficiency_lph);
    if (form.max_feed_size_mm.trim())       payload.max_feed_size_mm       = n(form.max_feed_size_mm);
    if (form.capacity_tph_min.trim())       payload.capacity_tph_min       = n(form.capacity_tph_min);
    if (form.capacity_tph_max.trim())       payload.capacity_tph_max       = n(form.capacity_tph_max);
    if (form.operating_cost_per_ton.trim()) payload.operating_cost_per_ton = n(form.operating_cost_per_ton);
    if (form.wear_cost_per_ton.trim())      payload.wear_cost_per_ton      = n(form.wear_cost_per_ton);

    if (Object.keys(payload).length === 0) { show("No changes to save", "info"); return; }

    try {
      await mutate(id, payload as never);
      show("Technical master saved!", "success");
      onSaved();
    } catch (err) {
      show(err instanceof Error ? err.message : "Failed to save", "error");
    }
  };

  return (
    <>
      {ToastEl}
      <SectionCard title="Technical Master" subtitle="Power, feed, capacity and cost fundamentals">
        <FormGrid cols={3}>
          <Field label="Weight (kg)" hint="Operating weight in kilograms" error={errors.weight_kg}>
            <Input type="number" value={form.weight_kg} onChange={set("weight_kg")} placeholder="e.g. 48000" error={errors.weight_kg} />
          </Field>
          <Field label="Power (kW)" hint="Installed power in kilowatts" error={errors.power_kw}>
            <Input type="number" value={form.power_kw} onChange={set("power_kw")} placeholder="e.g. 250" error={errors.power_kw} />
          </Field>
          <Field label="Drive Type">
            <Select value={form.drive_type} onChange={set("drive_type")} placeholder="Select…"
              options={[
                { value: "diesel",         label: "Diesel" },
                { value: "electric",       label: "Electric" },
                { value: "diesel-electric",label: "Diesel-Electric" },
              ]} />
          </Field>
          <Field label="Engine Model">
            <Input value={form.engine_model} onChange={set("engine_model")} placeholder="e.g. CAT C9.3" />
          </Field>
          <Field label="Fuel Efficiency (L/h)" hint="Average consumption at full load" error={errors.fuel_efficiency_lph}>
            <Input type="number" value={form.fuel_efficiency_lph} onChange={set("fuel_efficiency_lph")} placeholder="e.g. 28" error={errors.fuel_efficiency_lph} />
          </Field>
          <Field label="Max Feed Size (mm)" hint="Maximum material feed size" error={errors.max_feed_size_mm}>
            <Input type="number" value={form.max_feed_size_mm} onChange={set("max_feed_size_mm")} placeholder="e.g. 800" error={errors.max_feed_size_mm} />
          </Field>
          <Field label="Capacity Min (tph)" hint="Minimum throughput" error={errors.capacity_tph_min}>
            <Input type="number" value={form.capacity_tph_min} onChange={set("capacity_tph_min")} placeholder="e.g. 100" error={errors.capacity_tph_min} />
          </Field>
          <Field label="Capacity Max (tph)" hint="Maximum throughput" error={errors.capacity_tph_max}>
            <Input type="number" value={form.capacity_tph_max} onChange={set("capacity_tph_max")} placeholder="e.g. 400" error={errors.capacity_tph_max} />
          </Field>
          <Field label="Operating Cost ($/t)" hint="All-in cost per tonne" error={errors.operating_cost_per_ton}>
            <Input type="number" value={form.operating_cost_per_ton} onChange={set("operating_cost_per_ton")} placeholder="e.g. 1.5" error={errors.operating_cost_per_ton} />
          </Field>
          <Field label="Wear Cost ($/t)" hint="Wear-parts cost per tonne" error={errors.wear_cost_per_ton}>
            <Input type="number" value={form.wear_cost_per_ton} onChange={set("wear_cost_per_ton")} placeholder="e.g. 0.8" error={errors.wear_cost_per_ton} />
          </Field>
        </FormGrid>
        <SaveBtn loading={loading} onClick={handleSave} label="Save Technical Master" />
      </SectionCard>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: Performance Curves
// Backend schema: feed_size_mm, css_mm, capacity_tph_min, capacity_tph_max,
//                 reduction_ratio, power_draw_kw, notes
// ─────────────────────────────────────────────────────────────────────────────

const PERF_COLS = [
  { key: "feed_size_mm",     label: "Feed (mm)",       width: 90 },
  { key: "css_mm",           label: "CSS (mm)",        width: 80 },
  { key: "capacity_range",   label: "Capacity (tph)",  width: 130 },
  { key: "reduction_ratio",  label: "Reduction",       width: 90 },
  { key: "power_draw_kw",    label: "Power (kW)",      width: 90 },
  { key: "notes",            label: "Notes" },
  { key: "_actions",         label: "",                width: 60 },
];

interface PerformanceErrors {
  feed_size_mm?: string;
  css_mm?: string;
  capacity_tph_min?: string;
  capacity_tph_max?: string;
  reduction_ratio?: string;
  power_draw_kw?: string;
}

function PerformanceSection({ spec, onSaved }: { spec: EquipmentSpec; onSaved: () => void }) {
  const { show, ToastEl } = useToast();
  const id = spec.identity.equipment_id;
  // Backend returns spec.technical.performance array of rows
  const [rows, setRows] = useState<PerformanceRow[]>(spec.technical?.performance ?? []);
  const [adding, setAdding] = useState(false);
  const [errors, setErrors] = useState<PerformanceErrors>({});
  const [form, setForm] = useState({
    feed_size_mm: "", css_mm: "", capacity_tph_min: "",
    capacity_tph_max: "", reduction_ratio: "", power_draw_kw: "", notes: "",
  });
  const [saving, setSaving] = useState(false);

  const n = (v: string) => v.trim() !== "" ? Number(v) : undefined;

  const resetForm = () => {
    setForm({ feed_size_mm: "", css_mm: "", capacity_tph_min: "", capacity_tph_max: "", reduction_ratio: "", power_draw_kw: "", notes: "" });
    setErrors({});
  };

  const validate = (): boolean => {
    const e: PerformanceErrors = {};
    const pos = (v: string, f: keyof PerformanceErrors, max: number, label: string) => {
      if (!v.trim()) return;
      const num = Number(v);
      if (isNaN(num) || num <= 0 || num > max) e[f] = `${label} must be > 0 and ≤ ${max}`;
    };
    pos(form.feed_size_mm,    "feed_size_mm",    3000,  "Feed size (mm)");
    pos(form.css_mm,          "css_mm",          500,   "CSS (mm)");
    pos(form.capacity_tph_min,"capacity_tph_min",10000, "Capacity min (tph)");
    pos(form.capacity_tph_max,"capacity_tph_max",10000, "Capacity max (tph)");
    pos(form.reduction_ratio, "reduction_ratio", 100,   "Reduction ratio");
    pos(form.power_draw_kw,   "power_draw_kw",   5000,  "Power draw (kW)");
    if (form.capacity_tph_min && form.capacity_tph_max) {
      if (Number(form.capacity_tph_min) > Number(form.capacity_tph_max))
        e.capacity_tph_min = "Min capacity cannot exceed max";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = async () => {
    if (!validate()) { show("Fix the errors above before adding", "error"); return; }
    // Must send at least one field
    const payload: Record<string, unknown> = {};
    if (form.feed_size_mm.trim())    payload.feed_size_mm    = n(form.feed_size_mm);
    if (form.css_mm.trim())          payload.css_mm          = n(form.css_mm);
    if (form.capacity_tph_min.trim())payload.capacity_tph_min = n(form.capacity_tph_min);
    if (form.capacity_tph_max.trim())payload.capacity_tph_max = n(form.capacity_tph_max);
    if (form.reduction_ratio.trim()) payload.reduction_ratio = n(form.reduction_ratio);
    if (form.power_draw_kw.trim())   payload.power_draw_kw  = n(form.power_draw_kw);
    if (form.notes.trim())           payload.notes           = form.notes.trim();

    if (Object.keys(payload).length === 0) { show("Enter at least one value", "error"); return; }

    setSaving(true);
    try {
      const res = await equipmentAPI.technical.addPerformance(id, payload as never);
      setRows(r => [...r, res.row]);
      resetForm();
      setAdding(false);
      show("Performance row added!", "success");
      onSaved();
    } catch (err) {
      show(err instanceof Error ? err.message : "Failed to add performance row", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (rowId: number) => {
    if (!confirm("Delete this performance row?")) return;
    try {
      await equipmentAPI.technical.deletePerformance(id, rowId);
      setRows(r => r.filter(x => x.id !== rowId));
      show("Row deleted", "success");
      onSaved();
    } catch (err) {
      show(err instanceof Error ? err.message : "Failed to delete row", "error");
    }
  };

  const tableRows = rows.map(r => ({
    feed_size_mm:    r.feed_size_mm    ? `${r.feed_size_mm} mm`  : "—",
    css_mm:          r.css_mm          ? `${r.css_mm} mm`        : "—",
    capacity_range:  (r.capacity_tph_min || r.capacity_tph_max)
      ? `${r.capacity_tph_min ?? ""}–${r.capacity_tph_max ?? ""} tph` : "—",
    reduction_ratio: r.reduction_ratio ? `${r.reduction_ratio}×` : "—",
    power_draw_kw:   r.power_draw_kw   ? `${r.power_draw_kw} kW`: "—",
    notes:           r.notes ?? "—",
    _actions: (
      <IconBtn onClick={() => handleDelete(r.id)} danger title="Delete row">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>
        </svg>
      </IconBtn>
    ),
  }));

  return (
    <>
      {ToastEl}
      <SectionCard
        title="Performance Curves"
        subtitle="CSS vs capacity data rows (all fields optional, enter at least one)"
        action={
          <button onClick={() => { setAdding(a => !a); if (adding) resetForm(); }}
            className="btn-secondary" style={{ height: 30, padding: "0 12px", fontSize: 12 }}>
            {adding ? "Cancel" : "+ Add Row"}
          </button>
        }
      >
        {adding && (
          <div style={{ background: DASH.surface2, borderRadius: 10, padding: 14, marginBottom: 14, border: `1px solid ${DASH.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: DASH.text }}>New Performance Row</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 10 }}>
              <Field label="Feed Size (mm)" error={errors.feed_size_mm}>
                <Input type="number" value={form.feed_size_mm} onChange={v => { setForm(f => ({ ...f, feed_size_mm: v })); setErrors(e => ({ ...e, feed_size_mm: undefined })); }} placeholder="mm" error={errors.feed_size_mm} />
              </Field>
              <Field label="CSS (mm)" error={errors.css_mm}>
                <Input type="number" value={form.css_mm} onChange={v => { setForm(f => ({ ...f, css_mm: v })); setErrors(e => ({ ...e, css_mm: undefined })); }} placeholder="mm" error={errors.css_mm} />
              </Field>
              <Field label="Capacity Min (tph)" error={errors.capacity_tph_min}>
                <Input type="number" value={form.capacity_tph_min} onChange={v => { setForm(f => ({ ...f, capacity_tph_min: v })); setErrors(e => ({ ...e, capacity_tph_min: undefined })); }} placeholder="TPH" error={errors.capacity_tph_min} />
              </Field>
              <Field label="Capacity Max (tph)" error={errors.capacity_tph_max}>
                <Input type="number" value={form.capacity_tph_max} onChange={v => { setForm(f => ({ ...f, capacity_tph_max: v })); setErrors(e => ({ ...e, capacity_tph_max: undefined })); }} placeholder="TPH" error={errors.capacity_tph_max} />
              </Field>
              <Field label="Reduction Ratio" error={errors.reduction_ratio}>
                <Input type="number" value={form.reduction_ratio} onChange={v => { setForm(f => ({ ...f, reduction_ratio: v })); setErrors(e => ({ ...e, reduction_ratio: undefined })); }} placeholder="e.g. 6" error={errors.reduction_ratio} />
              </Field>
              <Field label="Power Draw (kW)" error={errors.power_draw_kw}>
                <Input type="number" value={form.power_draw_kw} onChange={v => { setForm(f => ({ ...f, power_draw_kw: v })); setErrors(e => ({ ...e, power_draw_kw: undefined })); }} placeholder="kW" error={errors.power_draw_kw} />
              </Field>
              <div style={{ gridColumn: "span 2" }}>
                <Field label="Notes">
                  <Input value={form.notes} onChange={v => setForm(f => ({ ...f, notes: v }))} placeholder="Optional notes" />
                </Field>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={resetForm} className="btn-secondary" style={{ height: 32, padding: "0 14px", fontSize: 12 }}>Reset</button>
              <button onClick={handleAdd} className="btn-primary" style={{ height: 32, padding: "0 14px", fontSize: 12 }} disabled={saving}>
                {saving ? "Adding…" : "Add Row"}
              </button>
            </div>
          </div>
        )}
        <DataTable columns={PERF_COLS} rows={tableRows} emptyText="No performance data yet. Click '+ Add Row' to add one." />
      </SectionCard>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: Wear Parts
// Backend schema: part_name (req), part_number, material, expected_life_hours,
//                 weight_kg, unit_cost_usd, oem_compatible, notes
// ─────────────────────────────────────────────────────────────────────────────

const WEAR_COLS = [
  { key: "part_name",            label: "Part Name" },
  { key: "part_number",          label: "Part #" },
  { key: "material",             label: "Material" },
  { key: "expected_life_hours",  label: "Life (hr)" },
  { key: "unit_cost_usd",        label: "Cost (USD)" },
  { key: "weight_kg",            label: "Wt (kg)" },
  { key: "_actions",             label: "", width: 60 },
];

interface WearPartErrors {
  part_name?: string;
  expected_life_hours?: string;
  unit_cost_usd?: string;
  weight_kg?: string;
}

function WearPartsSection({ spec, onSaved }: { spec: EquipmentSpec; onSaved: () => void }) {
  const { show, ToastEl } = useToast();
  const id = spec.identity.equipment_id;
  const [parts, setParts] = useState<WearPart[]>(spec.technical?.wear_parts ?? []);
  const [adding, setAdding] = useState(false);
  const [errors, setErrors] = useState<WearPartErrors>({});
  // Form uses backend field names directly
  const [form, setForm] = useState({
    part_name: "", part_number: "", material: "",
    weight_kg: "", expected_life_hours: "", unit_cost_usd: "",
    oem_compatible: "true", notes: "",
  });
  const [saving, setSaving] = useState(false);

  const n = (v: string) => v.trim() !== "" ? Number(v) : undefined;

  const set = (k: string) => (v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k as keyof WearPartErrors]) setErrors(prev => ({ ...prev, [k]: undefined }));
  };

  const validate = (): boolean => {
    const e: WearPartErrors = {};
    if (!form.part_name.trim()) {
      e.part_name = "Part name is required (max 150 chars)";
    } else if (form.part_name.trim().length > 150) {
      e.part_name = "Part name must be ≤ 150 characters";
    }
    if (form.expected_life_hours.trim()) {
      const v = Number(form.expected_life_hours);
      if (isNaN(v) || v <= 0) e.expected_life_hours = "Life hours must be a positive number";
    }
    if (form.unit_cost_usd.trim()) {
      const v = Number(form.unit_cost_usd);
      if (isNaN(v) || v <= 0) e.unit_cost_usd = "Cost must be a positive number";
    }
    if (form.weight_kg.trim()) {
      const v = Number(form.weight_kg);
      if (isNaN(v) || v <= 0) e.weight_kg = "Weight must be a positive number";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = async () => {
    if (!validate()) { show("Fix the errors above before adding", "error"); return; }
    setSaving(true);
    try {
      const res = await equipmentAPI.technical.addWearPart(id, {
        part_name:           form.part_name.trim(),
        part_number:         form.part_number.trim() || undefined,
        material:            form.material.trim()    || undefined,
        weight_kg:           n(form.weight_kg),
        expected_life_hours: n(form.expected_life_hours),  // ← correct backend field
        unit_cost_usd:       n(form.unit_cost_usd),        // ← correct backend field
        oem_compatible:      form.oem_compatible === "true",
        notes:               form.notes.trim()       || undefined,
      } as never);
      setParts(p => [...p, res.part]);
      setForm({ part_name: "", part_number: "", material: "", weight_kg: "", expected_life_hours: "", unit_cost_usd: "", oem_compatible: "true", notes: "" });
      setAdding(false);
      setErrors({});
      show(`"${form.part_name}" added!`, "success");
      onSaved();
    } catch (err) {
      show(err instanceof Error ? err.message : "Failed to add wear part", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (partId: number, partName: string) => {
    if (!confirm(`Delete wear part "${partName}"?`)) return;
    try {
      await equipmentAPI.technical.deleteWearPart(id, partId);
      setParts(p => p.filter(x => x.id !== partId));  // ← use .id not .part_id
      show(`"${partName}" deleted`, "success");
      onSaved();
    } catch (err) {
      show(err instanceof Error ? err.message : "Failed to delete wear part", "error");
    }
  };

  const tableRows = parts.map(p => ({
    part_name:           <span style={{ fontWeight: 600 }}>{p.part_name}</span>,
    part_number:         p.part_number ?? "—",
    material:            p.material    ?? "—",
    expected_life_hours: p.expected_life_hours ? `${p.expected_life_hours.toLocaleString()} hr` : "—",
    unit_cost_usd:       p.unit_cost_usd       ? `$${p.unit_cost_usd.toLocaleString()}`         : "—",
    weight_kg:           p.weight_kg            ? `${p.weight_kg} kg`                           : "—",
    _actions: (
      <IconBtn onClick={() => handleDelete(p.id, p.part_name)} danger title="Delete">
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
        title="Wear Parts"
        subtitle="Consumable components and replacement data"
        action={
          <button onClick={() => { setAdding(a => !a); setErrors({}); }}
            className="btn-secondary" style={{ height: 30, padding: "0 12px", fontSize: 12 }}>
            {adding ? "Cancel" : "+ Add Part"}
          </button>
        }
      >
        {adding && (
          <div style={{ background: DASH.surface2, borderRadius: 10, padding: 14, marginBottom: 14, border: `1px solid ${DASH.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: DASH.text }}>New Wear Part</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px 12px", marginBottom: 10 }}>
              <Field label="Part Name" required error={errors.part_name}>
                <Input value={form.part_name} onChange={set("part_name")} placeholder="e.g. Fixed Jaw Plate" error={errors.part_name} />
              </Field>
              <Field label="Part Number">
                <Input value={form.part_number} onChange={set("part_number")} placeholder="e.g. SB-JP-110" />
              </Field>
              <Field label="Material">
                <Input value={form.material} onChange={set("material")} placeholder="e.g. Mn18Cr2" />
              </Field>
              <Field label="Weight (kg)" error={errors.weight_kg}>
                <Input type="number" value={form.weight_kg} onChange={set("weight_kg")} placeholder="kg" error={errors.weight_kg} />
              </Field>
              <Field label="Expected Life (hours)" error={errors.expected_life_hours}>
                <Input type="number" value={form.expected_life_hours} onChange={set("expected_life_hours")} placeholder="e.g. 1500" error={errors.expected_life_hours} />
              </Field>
              <Field label="Unit Cost (USD)" error={errors.unit_cost_usd}>
                <Input type="number" value={form.unit_cost_usd} onChange={set("unit_cost_usd")} placeholder="e.g. 2500" error={errors.unit_cost_usd} />
              </Field>
              <Field label="OEM Compatible">
                <Select value={form.oem_compatible} onChange={set("oem_compatible")}
                  options={[{ value: "true", label: "Yes" }, { value: "false", label: "No" }]} />
              </Field>
              <div style={{ gridColumn: "span 2" }}>
                <Field label="Notes">
                  <Input value={form.notes} onChange={set("notes")} placeholder="Additional notes" />
                </Field>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => { setAdding(false); setErrors({}); setForm({ part_name: "", part_number: "", material: "", weight_kg: "", expected_life_hours: "", unit_cost_usd: "", oem_compatible: "true", notes: "" }); }}
                className="btn-secondary" style={{ height: 32, padding: "0 14px", fontSize: 12 }}>Cancel</button>
              <button onClick={handleAdd} className="btn-primary" style={{ height: 32, padding: "0 14px", fontSize: 12 }} disabled={saving}>
                {saving ? "Adding…" : "Add Part"}
              </button>
            </div>
          </div>
        )}
        <DataTable columns={WEAR_COLS} rows={tableRows} emptyText="No wear parts listed yet. Click '+ Add Part' to add one." />
      </SectionCard>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: Maintenance Schedule
// Backend schema: task_name (req), interval_hours, interval_days,
//                 duration_hours, skill_level, parts_required, notes
// ─────────────────────────────────────────────────────────────────────────────

const MAINT_COLS = [
  { key: "task_name",      label: "Task" },
  { key: "interval",       label: "Interval" },
  { key: "duration_hours", label: "Est. Duration" },
  { key: "skill_level",    label: "Skill Level" },
  { key: "parts_required", label: "Parts Required" },
  { key: "_actions",       label: "", width: 60 },
];

interface MaintenanceErrors {
  task_name?: string;
  interval_hours?: string;
  interval_days?: string;
  duration_hours?: string;
}

function MaintenanceSection({ spec, onSaved }: { spec: EquipmentSpec; onSaved: () => void }) {
  const { show, ToastEl } = useToast();
  const id = spec.identity.equipment_id;
  const [tasks, setTasks] = useState<MaintenanceTask[]>(spec.technical?.maintenance ?? []);
  const [adding, setAdding] = useState(false);
  const [errors, setErrors] = useState<MaintenanceErrors>({});
  // Form uses backend field names directly
  const [form, setForm] = useState({
    task_name: "", interval_hours: "", interval_days: "",
    duration_hours: "",       // ← correct backend field (NOT estimated_hours)
    skill_level: "",          // ← correct backend field (NOT technician_level)
    parts_required: "", notes: "",
  });
  const [saving, setSaving] = useState(false);

  const n = (v: string) => v.trim() !== "" ? Number(v) : undefined;

  const set = (k: string) => (v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k as keyof MaintenanceErrors]) setErrors(prev => ({ ...prev, [k]: undefined }));
  };

  const validate = (): boolean => {
    const e: MaintenanceErrors = {};
    if (!form.task_name.trim()) {
      e.task_name = "Task name is required (max 200 chars)";
    } else if (form.task_name.trim().length > 200) {
      e.task_name = "Task name must be ≤ 200 characters";
    }
    if (form.interval_hours.trim()) {
      const v = Number(form.interval_hours);
      if (isNaN(v) || v <= 0) e.interval_hours = "Interval hours must be a positive number";
    }
    if (form.interval_days.trim()) {
      const v = Number(form.interval_days);
      if (isNaN(v) || v <= 0 || !Number.isInteger(v)) e.interval_days = "Interval days must be a positive integer";
    }
    if (form.duration_hours.trim()) {
      const v = Number(form.duration_hours);
      if (isNaN(v) || v <= 0) e.duration_hours = "Duration must be a positive number";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = async () => {
    if (!validate()) { show("Fix the errors above before adding", "error"); return; }
    setSaving(true);
    try {
      const res = await equipmentAPI.technical.addMaintenance(id, {
        task_name:      form.task_name.trim(),
        interval_hours: n(form.interval_hours),
        interval_days:  n(form.interval_days),
        duration_hours: n(form.duration_hours),    // ← correct backend field
        skill_level:    (form.skill_level as never) || undefined,  // ← correct backend field
        parts_required: form.parts_required.trim() || undefined,
        notes:          form.notes.trim()          || undefined,
      } as never);
      setTasks(t => [...t, res.task]);
      setForm({ task_name: "", interval_hours: "", interval_days: "", duration_hours: "", skill_level: "", parts_required: "", notes: "" });
      setAdding(false);
      setErrors({});
      show(`"${form.task_name}" added!`, "success");
      onSaved();
    } catch (err) {
      show(err instanceof Error ? err.message : "Failed to add task", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (taskId: number, taskName: string) => {
    if (!confirm(`Delete maintenance task "${taskName}"?`)) return;
    try {
      await equipmentAPI.technical.deleteMaintenance(id, taskId);
      setTasks(t => t.filter(x => x.id !== taskId));  // ← use .id not .task_id
      show(`"${taskName}" deleted`, "success");
      onSaved();
    } catch (err) {
      show(err instanceof Error ? err.message : "Failed to delete task", "error");
    }
  };

  const tableRows = tasks.map(t => ({
    task_name:      <span style={{ fontWeight: 600 }}>{t.task_name}</span>,
    interval:       t.interval_hours
      ? `${t.interval_hours.toLocaleString()} hr`
      : t.interval_days
        ? `${t.interval_days} days`
        : "—",
    duration_hours: t.duration_hours ? `${t.duration_hours} hr` : "—",
    skill_level:    t.skill_level
      ? t.skill_level.charAt(0).toUpperCase() + t.skill_level.slice(1)
      : "—",
    parts_required: t.parts_required ?? "—",
    _actions: (
      <IconBtn onClick={() => handleDelete(t.id, t.task_name)} danger title="Delete task">
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
        title="Maintenance Schedule"
        subtitle="Preventive maintenance tasks and intervals"
        action={
          <button onClick={() => { setAdding(a => !a); setErrors({}); }}
            className="btn-secondary" style={{ height: 30, padding: "0 12px", fontSize: 12 }}>
            {adding ? "Cancel" : "+ Add Task"}
          </button>
        }
      >
        {adding && (
          <div style={{ background: DASH.surface2, borderRadius: 10, padding: 14, marginBottom: 14, border: `1px solid ${DASH.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: DASH.text }}>New Maintenance Task</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px 12px", marginBottom: 10 }}>
              <Field label="Task Name" required error={errors.task_name}>
                <Input value={form.task_name} onChange={set("task_name")} placeholder="e.g. Check jaw clearance" error={errors.task_name} />
              </Field>
              <Field label="Interval (hours)" hint="Service interval in operating hours" error={errors.interval_hours}>
                <Input type="number" value={form.interval_hours} onChange={set("interval_hours")} placeholder="e.g. 500" error={errors.interval_hours} />
              </Field>
              <Field label="Interval (days)" hint="Calendar-based interval in days" error={errors.interval_days}>
                <Input type="number" value={form.interval_days} onChange={set("interval_days")} placeholder="e.g. 90" error={errors.interval_days} />
              </Field>
              <Field label="Duration (hours)" hint="Estimated time to complete" error={errors.duration_hours}>
                <Input type="number" value={form.duration_hours} onChange={set("duration_hours")} placeholder="e.g. 4" error={errors.duration_hours} />
              </Field>
              <Field label="Skill Level">
                <Select value={form.skill_level} onChange={set("skill_level")} placeholder="Select…"
                  options={[
                    { value: "operator",    label: "Operator" },
                    { value: "technician",  label: "Technician" },
                    { value: "specialist",  label: "Specialist" },
                  ]} />
              </Field>
              <Field label="Parts Required">
                <Input value={form.parts_required} onChange={set("parts_required")} placeholder="e.g. Grease, filter" />
              </Field>
              <div style={{ gridColumn: "1/-1" }}>
                <Field label="Notes">
                  <Textarea value={form.notes} onChange={set("notes")} rows={2} placeholder="Additional notes…" />
                </Field>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => { setAdding(false); setErrors({}); setForm({ task_name: "", interval_hours: "", interval_days: "", duration_hours: "", skill_level: "", parts_required: "", notes: "" }); }}
                className="btn-secondary" style={{ height: 32, padding: "0 14px", fontSize: 12 }}>Cancel</button>
              <button onClick={handleAdd} className="btn-primary" style={{ height: 32, padding: "0 14px", fontSize: 12 }} disabled={saving}>
                {saving ? "Adding…" : "Add Task"}
              </button>
            </div>
          </div>
        )}
        <DataTable columns={MAINT_COLS} rows={tableRows} emptyText="No maintenance tasks yet. Click '+ Add Task' to add one." />
      </SectionCard>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Technical Tab
// ─────────────────────────────────────────────────────────────────────────────

export default function TechnicalTab({ spec, onRefresh }: { spec: EquipmentSpec; onRefresh: () => void }) {
  return (
    <div>
      <TechnicalMasterSection spec={spec} onSaved={onRefresh} />
      <PerformanceSection     spec={spec} onSaved={onRefresh} />
      <WearPartsSection       spec={spec} onSaved={onRefresh} />
      <MaintenanceSection     spec={spec} onSaved={onRefresh} />
    </div>
  );
}