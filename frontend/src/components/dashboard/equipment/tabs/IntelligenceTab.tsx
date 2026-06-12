"use client";

/**
 * IntelligenceTab — StratumIQ
 * Layer E: Competitive Benchmarks, Application Suitability, AI Ratings, Operator Reviews.
 *
 * FIELD NAME ALIGNMENT (frontend → backend DB columns):
 *   competitive_benchmark:  id (NOT bench_id)
 *   user_reviews:           id (NOT review_id)
 *   application_suitability, equipment_ratings: all field names match backend exactly
 *
 * VALIDATION RULES (matched to equipment_validation.js):
 *   benchmark:
 *     competitor_model: required, max 150 chars
 *     parameter:        required, max 150 chars
 *     our_value / competitor_value: any number (positive or negative allowed)
 *     unit:             max 30 chars
 *     advantage:        enum positive/negative/neutral
 *     notes:            max 1000 chars
 *   suitability:
 *     abrasiveness_idx_max:  positive number (no upper limit in Joi — just positive())
 *     feed_moisture_max_pct: 0–100
 *     notes:                 max 2000 chars
 *   ratings:
 *     fuel_efficiency / engine_rating / maintenance_simplicity /
 *     reliability / parts_availability: enum poor/fair/good/very_good/excellent
 *     tco_rating: enum economical/fair/good/premium
 *     overall_score: 0–5
 *   review:
 *     rating:            1–5 integer (REQUIRED)
 *     review_text:       max 5000 chars
 *     operational_hours: positive number
 *     site_type:         max 100 chars
 *     site_location:     max 150 chars
 */

import { useState } from "react";
import { BRAND, DASH } from "@/lib/constants";
import { equipmentApi as equipmentAPI } from "@/lib/api/equipment";
import { useMutation } from "../hooks/useEquipment";
import {
  Field, Input, Select, Textarea, Toggle, SaveBtn,
  SectionCard, FormGrid, FormRow, DataTable, IconBtn, Badge, useToast,
} from "../shared/EqUI";
import type { EquipmentSpec, Benchmark, Review, RatingLabel, TCOLabel } from "@/types/equipment";

const O = BRAND.orange;

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: Competitive Benchmarks
// ─────────────────────────────────────────────────────────────────────────────

const BENCH_COLS = [
  { key: "competitor_model", label: "Competitor" },
  { key: "parameter",        label: "Parameter" },
  { key: "our_value",        label: "Ours" },
  { key: "competitor_value", label: "Theirs" },
  { key: "unit",             label: "Unit" },
  { key: "advantage",        label: "Advantage" },
  { key: "_actions",         label: "", width: 60 },
];

interface BenchmarkErrors {
  competitor_model?: string;
  parameter?: string;
  our_value?: string;
  competitor_value?: string;
  unit?: string;
  notes?: string;
}

function BenchmarksSection({ spec, onSaved }: { spec: EquipmentSpec; onSaved: () => void }) {
  const { show, ToastEl } = useToast();
  const id = spec.identity.equipment_id;
  const [items, setItems] = useState<Benchmark[]>(spec.intelligence?.benchmarks ?? []);
  const [adding, setAdding] = useState(false);
  const [errors, setErrors] = useState<BenchmarkErrors>({});
  const [form, setForm] = useState({
    competitor_model: "", parameter: "", our_value: "",
    competitor_value: "", unit: "", advantage: "", notes: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k: string) => (v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k as keyof BenchmarkErrors]) setErrors(prev => ({ ...prev, [k]: undefined }));
  };

  const n = (v: string) => v.trim() !== "" ? Number(v) : undefined;

  const validate = (): boolean => {
    const e: BenchmarkErrors = {};
    if (!form.competitor_model.trim()) {
      e.competitor_model = "Competitor model is required";
    } else if (form.competitor_model.trim().length > 150) {
      e.competitor_model = "Competitor model must be ≤ 150 characters";
    }
    if (!form.parameter.trim()) {
      e.parameter = "Parameter is required";
    } else if (form.parameter.trim().length > 150) {
      e.parameter = "Parameter must be ≤ 150 characters";
    }
    // our_value and competitor_value: any number allowed (can be negative)
    if (form.our_value.trim() && isNaN(Number(form.our_value)))       e.our_value       = "Must be a valid number";
    if (form.competitor_value.trim() && isNaN(Number(form.competitor_value))) e.competitor_value = "Must be a valid number";
    if (form.unit.trim().length > 30)  e.unit  = "Unit must be ≤ 30 characters";
    if (form.notes.trim().length > 1000) e.notes = "Notes must be ≤ 1,000 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = async () => {
    if (!validate()) { show("Fix the errors above before adding", "error"); return; }
    setSaving(true);
    try {
      const res = await equipmentAPI.intelligence.addBenchmark(id, {
        competitor_model: form.competitor_model.trim(),
        parameter:        form.parameter.trim(),
        our_value:        n(form.our_value),
        competitor_value: n(form.competitor_value),
        unit:             form.unit.trim()    || undefined,
        advantage:        (form.advantage as never) || undefined,
        notes:            form.notes.trim()   || undefined,
      } as never);
      setItems(b => [...b, res.bench]);
      setForm({ competitor_model: "", parameter: "", our_value: "", competitor_value: "", unit: "", advantage: "", notes: "" });
      setAdding(false);
      setErrors({});
      show(`Benchmark for "${form.parameter}" added!`, "success");
      onSaved();
    } catch (err) {
      show(err instanceof Error ? err.message : "Failed to add benchmark", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (benchId: number, parameter: string) => {
    if (!confirm(`Delete benchmark for "${parameter}"?`)) return;
    try {
      await equipmentAPI.intelligence.deleteBenchmark(id, benchId);
      setItems(b => b.filter(x => x.id !== benchId));   // ← use .id not .bench_id
      show(`Benchmark deleted`, "success");
      onSaved();
    } catch (err) {
      show(err instanceof Error ? err.message : "Failed to delete benchmark", "error");
    }
  };

  const rows = items.map(b => ({
    competitor_model: <span style={{ fontWeight: 600 }}>{b.competitor_model}</span>,
    parameter:        b.parameter,
    our_value:        b.our_value        != null ? b.our_value        : "—",
    competitor_value: b.competitor_value != null ? b.competitor_value : "—",
    unit:             b.unit ?? "—",
    advantage:        b.advantage ? <Badge label={b.advantage} variant={b.advantage} /> : "—",
    _actions: (
      <IconBtn onClick={() => handleDelete(b.id, b.parameter)} danger title="Delete benchmark">
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
        title="Competitive Benchmarks"
        subtitle="Side-by-side comparison against competitor models"
        action={
          <button onClick={() => { setAdding(a => !a); setErrors({}); }}
            className="btn-secondary" style={{ height: 30, padding: "0 12px", fontSize: 12 }}>
            {adding ? "Cancel" : "+ Add Benchmark"}
          </button>
        }
      >
        {adding && (
          <div style={{ background: DASH.surface2, borderRadius: 10, padding: 14, marginBottom: 14, border: `1px solid ${DASH.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: DASH.text }}>New Benchmark</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px 12px", marginBottom: 10 }}>
              <Field label="Competitor Model" required error={errors.competitor_model}>
                <Input value={form.competitor_model} onChange={set("competitor_model")}
                  placeholder="e.g. Metso LT106" error={errors.competitor_model} />
              </Field>
              <Field label="Parameter" required error={errors.parameter}>
                <Input value={form.parameter} onChange={set("parameter")}
                  placeholder="e.g. Capacity (tph)" error={errors.parameter} />
              </Field>
              <Field label="Unit" hint="Max 30 chars" error={errors.unit}>
                <Input value={form.unit} onChange={set("unit")} placeholder="e.g. tph, kW, kg" error={errors.unit} />
              </Field>
              <Field label="Our Value" hint="Any number" error={errors.our_value}>
                <Input type="number" value={form.our_value} onChange={set("our_value")} placeholder="Our value" error={errors.our_value} />
              </Field>
              <Field label="Competitor Value" hint="Any number" error={errors.competitor_value}>
                <Input type="number" value={form.competitor_value} onChange={set("competitor_value")} placeholder="Competitor value" error={errors.competitor_value} />
              </Field>
              <Field label="Advantage">
                <Select value={form.advantage} onChange={set("advantage")} placeholder="Select…"
                  options={[
                    { value: "positive", label: "✅ Positive (we win)" },
                    { value: "negative", label: "❌ Negative (they win)" },
                    { value: "neutral",  label: "➖ Neutral" },
                  ]} />
              </Field>
              <div style={{ gridColumn: "1/-1" }}>
                <Field label="Notes" hint="Max 1,000 characters" error={errors.notes}>
                  <Input value={form.notes} onChange={set("notes")} placeholder="Additional context…" error={errors.notes} />
                </Field>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => { setAdding(false); setErrors({}); setForm({ competitor_model: "", parameter: "", our_value: "", competitor_value: "", unit: "", advantage: "", notes: "" }); }}
                className="btn-secondary" style={{ height: 32, padding: "0 14px", fontSize: 12 }}>Cancel</button>
              <button onClick={handleAdd} className="btn-primary" style={{ height: 32, padding: "0 14px", fontSize: 12 }} disabled={saving}>
                {saving ? "Adding…" : "Add Benchmark"}
              </button>
            </div>
          </div>
        )}
        <DataTable columns={BENCH_COLS} rows={rows} emptyText="No benchmarks yet. Click '+ Add Benchmark' to add one." />
      </SectionCard>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: Application Suitability
// Backend: abrasiveness_idx_max (positive(), no upper limit), feed_moisture_max_pct (0–100)
// ─────────────────────────────────────────────────────────────────────────────

interface SuitabilityErrors {
  abrasiveness_idx_max?: string;
  feed_moisture_max_pct?: string;
  notes?: string;
}

function SuitabilitySection({ spec, onSaved }: { spec: EquipmentSpec; onSaved: () => void }) {
  const { show, ToastEl } = useToast();
  const { mutate, loading } = useMutation(equipmentAPI.intelligence.upsertSuitability);
  const id = spec.identity.equipment_id;
  const s = spec.intelligence?.suitability;
  const [errors, setErrors] = useState<SuitabilityErrors>({});

  const [form, setForm] = useState({
    hard_rock:             s?.hard_rock             ?? false,
    soft_rock:             s?.soft_rock             ?? false,
    recycling:             s?.recycling             ?? false,
    limestone:             s?.limestone             ?? false,
    river_gravel:          s?.river_gravel          ?? false,
    sand_gravel:           s?.sand_gravel           ?? false,
    wet_feed:              s?.wet_feed              ?? false,
    high_moisture:         s?.high_moisture         ?? false,
    primary_stage:         s?.primary_stage         ?? false,
    secondary_stage:       s?.secondary_stage       ?? false,
    tertiary_stage:        s?.tertiary_stage        ?? false,
    abrasiveness_idx_max:  String(s?.abrasiveness_idx_max  ?? ""),
    feed_moisture_max_pct: String(s?.feed_moisture_max_pct ?? ""),
    notes:                 s?.notes ?? "",
  });

  const set = (k: string) => (v: string | boolean) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k as keyof SuitabilityErrors]) setErrors(prev => ({ ...prev, [k]: undefined }));
  };

  const validate = (): boolean => {
    const e: SuitabilityErrors = {};
    // Backend: Joi.number().positive() — must be > 0, no upper bound
    if (form.abrasiveness_idx_max.trim()) {
      const v = Number(form.abrasiveness_idx_max);
      if (isNaN(v) || v <= 0) e.abrasiveness_idx_max = "Abrasiveness index must be a positive number (e.g. 0.45)";
    }
    // Backend: Joi.number().min(0).max(100)
    if (form.feed_moisture_max_pct.trim()) {
      const v = Number(form.feed_moisture_max_pct);
      if (isNaN(v) || v < 0 || v > 100) e.feed_moisture_max_pct = "Moisture must be between 0 and 100%";
    }
    if (form.notes.trim().length > 2000) e.notes = "Notes must be ≤ 2,000 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) { show("Fix the errors above before saving", "error"); return; }

    const payload: Record<string, unknown> = {
      hard_rock: form.hard_rock, soft_rock: form.soft_rock, recycling: form.recycling,
      limestone: form.limestone, river_gravel: form.river_gravel, sand_gravel: form.sand_gravel,
      wet_feed: form.wet_feed, high_moisture: form.high_moisture,
      primary_stage: form.primary_stage, secondary_stage: form.secondary_stage, tertiary_stage: form.tertiary_stage,
    };
    if (form.abrasiveness_idx_max.trim())  payload.abrasiveness_idx_max  = Number(form.abrasiveness_idx_max);
    if (form.feed_moisture_max_pct.trim()) payload.feed_moisture_max_pct = Number(form.feed_moisture_max_pct);
    if (form.notes.trim())                 payload.notes                 = form.notes.trim();

    try {
      await mutate(id, payload as never);
      show("Suitability profile saved!", "success");
      onSaved();
    } catch (err) {
      show(err instanceof Error ? err.message : "Failed to save suitability", "error");
    }
  };

  const toggleRow = (items: { key: string; label: string }[]) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {items.map(({ key, label }) => (
        <Toggle key={key} checked={(form as never)[key]} onChange={set(key) as (v: boolean) => void} label={label} />
      ))}
    </div>
  );

  return (
    <>
      {ToastEl}
      <SectionCard title="Application Suitability" subtitle="Material types, feed conditions and crushing stages">
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: DASH.text3, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Material Type</div>
            {toggleRow([
              { key: "hard_rock",    label: "Hard Rock" },
              { key: "soft_rock",    label: "Soft Rock" },
              { key: "limestone",    label: "Limestone" },
              { key: "river_gravel", label: "River Gravel" },
              { key: "sand_gravel",  label: "Sand & Gravel" },
              { key: "recycling",    label: "Recycling" },
            ])}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: DASH.text3, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Feed Conditions</div>
            {toggleRow([
              { key: "wet_feed",      label: "Wet Feed" },
              { key: "high_moisture", label: "High Moisture" },
            ])}
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: DASH.text3, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Crushing Stage</div>
            {toggleRow([
              { key: "primary_stage",   label: "Primary" },
              { key: "secondary_stage", label: "Secondary" },
              { key: "tertiary_stage",  label: "Tertiary" },
            ])}
          </div>
          <FormGrid cols={3}>
            <Field label="Max Abrasiveness Index" hint="Positive number, e.g. 0.45" error={errors.abrasiveness_idx_max}>
              <Input type="number" value={form.abrasiveness_idx_max}
                onChange={set("abrasiveness_idx_max") as (v: string) => void}
                placeholder="e.g. 0.45" error={errors.abrasiveness_idx_max} />
            </Field>
            <Field label="Max Feed Moisture (%)" hint="0–100" error={errors.feed_moisture_max_pct}>
              <Input type="number" value={form.feed_moisture_max_pct}
                onChange={set("feed_moisture_max_pct") as (v: string) => void}
                placeholder="e.g. 15" error={errors.feed_moisture_max_pct} />
            </Field>
            <FormRow>
              <Field label="Notes" hint="Max 2,000 characters" error={errors.notes}>
                <Textarea value={form.notes} onChange={set("notes") as (v: string) => void}
                  rows={2} placeholder="Additional suitability notes…" />
              </Field>
            </FormRow>
          </FormGrid>
        </div>
        <SaveBtn loading={loading} onClick={handleSave} label="Save Suitability" />
      </SectionCard>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: AI Ratings
// Backend enums: poor/fair/good/very_good/excellent and economical/fair/good/premium
// overall_score: 0–5
// ─────────────────────────────────────────────────────────────────────────────

const RATING_OPTS: { value: RatingLabel; label: string }[] = [
  { value: "poor",      label: "Poor" },
  { value: "fair",      label: "Fair" },
  { value: "good",      label: "Good" },
  { value: "very_good", label: "Very Good" },
  { value: "excellent", label: "Excellent" },
];

const TCO_OPTS: { value: TCOLabel; label: string }[] = [
  { value: "economical", label: "Economical" },
  { value: "fair",       label: "Fair" },
  { value: "good",       label: "Good" },
  { value: "premium",    label: "Premium" },
];

interface RatingsErrors {
  overall_score?: string;
}

function RatingsSection({ spec, onSaved }: { spec: EquipmentSpec; onSaved: () => void }) {
  const { show, ToastEl } = useToast();
  const { mutate, loading } = useMutation(equipmentAPI.intelligence.upsertRatings);
  const id = spec.identity.equipment_id;
  const r = spec.intelligence?.ratings;
  const [errors, setErrors] = useState<RatingsErrors>({});

  const [form, setForm] = useState({
    fuel_efficiency:        (r?.fuel_efficiency        ?? "") as string,
    engine_rating:          (r?.engine_rating          ?? "") as string,
    maintenance_simplicity: (r?.maintenance_simplicity ?? "") as string,
    reliability:            (r?.reliability            ?? "") as string,
    parts_availability:     (r?.parts_availability     ?? "") as string,
    tco_rating:             (r?.tco_rating             ?? "") as string,
    overall_score:          String(r?.overall_score    ?? ""),
  });

  const set = (k: string) => (v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    if (k === "overall_score") setErrors({});
  };

  const validate = (): boolean => {
    const e: RatingsErrors = {};
    if (form.overall_score.trim()) {
      const v = Number(form.overall_score);
      // Backend: Joi.number().min(0).max(5)
      if (isNaN(v) || v < 0 || v > 5) e.overall_score = "Overall score must be between 0.0 and 5.0";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) { show("Fix the errors above before saving", "error"); return; }

    const payload: Record<string, unknown> = {};
    if (form.fuel_efficiency)        payload.fuel_efficiency        = form.fuel_efficiency;
    if (form.engine_rating)          payload.engine_rating          = form.engine_rating;
    if (form.maintenance_simplicity) payload.maintenance_simplicity = form.maintenance_simplicity;
    if (form.reliability)            payload.reliability            = form.reliability;
    if (form.parts_availability)     payload.parts_availability     = form.parts_availability;
    if (form.tco_rating)             payload.tco_rating             = form.tco_rating;
    if (form.overall_score.trim())   payload.overall_score          = Number(form.overall_score);

    if (Object.keys(payload).length === 0) { show("Select at least one rating to save", "info"); return; }

    try {
      await mutate(id, payload as never);
      show("Ratings saved!", "success");
      onSaved();
    } catch (err) {
      show(err instanceof Error ? err.message : "Failed to save ratings", "error");
    }
  };

  return (
    <>
      {ToastEl}
      <SectionCard title="AI Ratings" subtitle="Attribute scores used by AI-powered recommendations">
        <FormGrid cols={3}>
          <Field label="Fuel Efficiency">
            <Select value={form.fuel_efficiency}        onChange={set("fuel_efficiency")}        placeholder="Select…" options={RATING_OPTS} />
          </Field>
          <Field label="Engine Rating">
            <Select value={form.engine_rating}          onChange={set("engine_rating")}          placeholder="Select…" options={RATING_OPTS} />
          </Field>
          <Field label="Maintenance Simplicity">
            <Select value={form.maintenance_simplicity} onChange={set("maintenance_simplicity")} placeholder="Select…" options={RATING_OPTS} />
          </Field>
          <Field label="Reliability">
            <Select value={form.reliability}            onChange={set("reliability")}            placeholder="Select…" options={RATING_OPTS} />
          </Field>
          <Field label="Parts Availability">
            <Select value={form.parts_availability}     onChange={set("parts_availability")}     placeholder="Select…" options={RATING_OPTS} />
          </Field>
          <Field label="TCO Rating" hint="Total Cost of Ownership">
            <Select value={form.tco_rating}             onChange={set("tco_rating")}             placeholder="Select…" options={TCO_OPTS} />
          </Field>
          <Field label="Overall Score (0–5)" hint="One decimal, e.g. 4.2" error={errors.overall_score}>
            <Input type="number" value={form.overall_score} onChange={set("overall_score")}
              placeholder="e.g. 4.2" error={errors.overall_score} />
          </Field>
        </FormGrid>
        <SaveBtn loading={loading} onClick={handleSave} label="Save Ratings" />
      </SectionCard>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: Operator Reviews
// Backend: rating (1–5, REQUIRED int), review_text (max 5000), operational_hours (positive),
//          site_type (max 100), site_location (max 150)
// DB PK: id (NOT review_id)
// ─────────────────────────────────────────────────────────────────────────────

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24"
          fill={i <= rating ? O : DASH.border} stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

const REVIEW_COLS = [
  { key: "rating",            label: "Rating" },
  { key: "review_text",       label: "Review" },
  { key: "site_type",         label: "Site Type" },
  { key: "operational_hours", label: "Op. Hours" },
  { key: "_actions",          label: "", width: 60 },
];

interface ReviewErrors {
  review_text?: string;
  operational_hours?: string;
  site_type?: string;
  site_location?: string;
}

function ReviewsSection({ spec, onSaved }: { spec: EquipmentSpec; onSaved: () => void }) {
  const { show, ToastEl } = useToast();
  const id = spec.identity.equipment_id;
  const [reviews, setReviews] = useState<Review[]>(spec.intelligence?.reviews ?? []);
  const [adding, setAdding] = useState(false);
  const [errors, setErrors] = useState<ReviewErrors>({});
  const [form, setForm] = useState({ rating: "5", review_text: "", operational_hours: "", site_type: "", site_location: "" });
  const [saving, setSaving] = useState(false);

  const set = (k: string) => (v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k as keyof ReviewErrors]) setErrors(prev => ({ ...prev, [k]: undefined }));
  };

  const validate = (): boolean => {
    const e: ReviewErrors = {};
    // rating validated via select — always 1–5
    if (form.review_text.trim().length > 5000)  e.review_text       = "Review text must be ≤ 5,000 characters";
    if (form.site_type.trim().length > 100)      e.site_type         = "Site type must be ≤ 100 characters";
    if (form.site_location.trim().length > 150)  e.site_location     = "Site location must be ≤ 150 characters";
    if (form.operational_hours.trim()) {
      const v = Number(form.operational_hours);
      if (isNaN(v) || v <= 0) e.operational_hours = "Operational hours must be a positive number";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = async () => {
    if (!validate()) { show("Fix the errors above before submitting", "error"); return; }
    setSaving(true);
    try {
      const res = await equipmentAPI.intelligence.addReview(id, {
        rating:            Number(form.rating),             // 1–5 integer, required
        review_text:       form.review_text.trim()  || undefined,
        operational_hours: form.operational_hours.trim() ? Number(form.operational_hours) : undefined,
        site_type:         form.site_type.trim()    || undefined,
        site_location:     form.site_location.trim() || undefined,
      } as never);
      setReviews(r => [...r, res.review]);
      setForm({ rating: "5", review_text: "", operational_hours: "", site_type: "", site_location: "" });
      setAdding(false);
      setErrors({});
      show(`Review (${form.rating}★) submitted!`, "success");
      onSaved();
    } catch (err) {
      show(err instanceof Error ? err.message : "Failed to submit review", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (!confirm("Delete this review?")) return;
    try {
      await equipmentAPI.intelligence.deleteReview(id, reviewId);
      setReviews(r => r.filter(x => x.id !== reviewId));  // ← use .id not .review_id
      show("Review deleted", "success");
      onSaved();
    } catch (err) {
      show(err instanceof Error ? err.message : "Failed to delete review", "error");
    }
  };

  const rows = reviews.map(r => ({
    rating:            <StarDisplay rating={r.rating} />,
    review_text:       <span style={{ maxWidth: 280, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.review_text ?? "—"}</span>,
    site_type:         r.site_type ?? "—",
    operational_hours: r.operational_hours ? `${r.operational_hours.toLocaleString()} hr` : "—",
    _actions: (
      <IconBtn onClick={() => handleDelete(r.id)} danger title="Delete review">
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
        title="Operator Reviews"
        subtitle="Field reviews from operators and site managers"
        action={
          <button onClick={() => { setAdding(a => !a); setErrors({}); }}
            className="btn-secondary" style={{ height: 30, padding: "0 12px", fontSize: 12 }}>
            {adding ? "Cancel" : "+ Add Review"}
          </button>
        }
      >
        {adding && (
          <div style={{ background: DASH.surface2, borderRadius: 10, padding: 14, marginBottom: 14, border: `1px solid ${DASH.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: DASH.text }}>New Operator Review</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px 12px", marginBottom: 10 }}>
              <Field label="Rating" required>
                <Select value={form.rating} onChange={set("rating")}
                  options={[5,4,3,2,1].map(n => ({ value: String(n), label: `${n} Star${n !== 1 ? "s" : ""}` }))} />
              </Field>
              <Field label="Site Type" hint="Max 100 chars" error={errors.site_type}>
                <Input value={form.site_type} onChange={set("site_type")}
                  placeholder="e.g. Quarry, Hard Rock Mining" error={errors.site_type} />
              </Field>
              <Field label="Site Location" hint="Max 150 chars" error={errors.site_location}>
                <Input value={form.site_location} onChange={set("site_location")}
                  placeholder="e.g. Rajasthan, India" error={errors.site_location} />
              </Field>
              <Field label="Operational Hours" hint="Total hours machine was operated" error={errors.operational_hours}>
                <Input type="number" value={form.operational_hours} onChange={set("operational_hours")}
                  placeholder="e.g. 8000" error={errors.operational_hours} />
              </Field>
              <div style={{ gridColumn: "1/-1" }}>
                <Field label="Review" hint="Max 5,000 characters" error={errors.review_text}>
                  <Textarea value={form.review_text} onChange={set("review_text")}
                    placeholder="Share your experience with this machine…" rows={3} />
                </Field>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => { setAdding(false); setErrors({}); setForm({ rating: "5", review_text: "", operational_hours: "", site_type: "", site_location: "" }); }}
                className="btn-secondary" style={{ height: 32, padding: "0 14px", fontSize: 12 }}>Cancel</button>
              <button onClick={handleAdd} className="btn-primary" style={{ height: 32, padding: "0 14px", fontSize: 12 }} disabled={saving}>
                {saving ? "Submitting…" : "Submit Review"}
              </button>
            </div>
          </div>
        )}
        <DataTable columns={REVIEW_COLS} rows={rows} emptyText="No reviews yet. Click '+ Add Review' to add one." />
      </SectionCard>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Intelligence Tab
// ─────────────────────────────────────────────────────────────────────────────

export default function IntelligenceTab({ spec, onRefresh }: { spec: EquipmentSpec; onRefresh: () => void }) {
  return (
    <div>
      <BenchmarksSection  spec={spec} onSaved={onRefresh} />
      <SuitabilitySection spec={spec} onSaved={onRefresh} />
      <RatingsSection     spec={spec} onSaved={onRefresh} />
      <ReviewsSection     spec={spec} onSaved={onRefresh} />
    </div>
  );
}