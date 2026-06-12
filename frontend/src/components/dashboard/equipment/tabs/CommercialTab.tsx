import { useState } from "react";
import { DASH } from "@/lib/constants";
import { equipmentApi as equipmentAPI } from "@/lib/api/equipment";
import { useMutation } from "../hooks/useEquipment";
import {
  Field, Input, Select, Textarea, Toggle, SaveBtn,
  SectionCard, FormGrid, FormRow, DataTable, IconBtn, useToast, Badge,
} from "../shared/EqUI";
import type { EquipmentSpec, Dealer, PricingRecord, Commercial } from "@/types/equipment";

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: Commercial Terms
// Backend schema: base_price_usd, price_range_min_usd, price_range_max_usd,
//   currency, incoterms, lead_time_weeks, warranty_months,
//   financing_available, rental_available, notes
// ─────────────────────────────────────────────────────────────────────────────

interface CommercialErrors {
  base_price_usd?: string;
  price_range_min_usd?: string;
  price_range_max_usd?: string;
  lead_time_weeks?: string;
  warranty_months?: string;
}

function CommercialTermsSection({ spec, onSaved }: { spec: EquipmentSpec; onSaved: () => void }) {
  const { show, ToastEl } = useToast();
  const { mutate, loading } = useMutation(equipmentAPI.commercial.upsert);
  const id = spec.identity.equipment_id;
  // spec.commercial.pricing holds the commercial row
  const c = spec.commercial?.pricing ?? {} as Partial<Commercial>;
  const [errors, setErrors] = useState<CommercialErrors>({});

  const [form, setForm] = useState({
    base_price_usd:       String(c.base_price_usd       ?? ""),
    price_range_min_usd:  String(c.price_range_min_usd  ?? ""),
    price_range_max_usd:  String(c.price_range_max_usd  ?? ""),
    currency:             c.currency    ?? "USD",
    incoterms:            c.incoterms   ?? "",
    lead_time_weeks:      String(c.lead_time_weeks  ?? ""),
    warranty_months:      String(c.warranty_months  ?? ""),
    financing_available:  c.financing_available ?? false,
    rental_available:     c.rental_available    ?? false,
    notes:                c.notes ?? "",
  });

  const n = (v: string) => v.trim() !== "" ? Number(v) : undefined;

  const set = (k: string) => (v: string | boolean) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k as keyof CommercialErrors]) setErrors(prev => ({ ...prev, [k]: undefined }));
  };

  const validate = (): boolean => {
    const e: CommercialErrors = {};
    if (form.base_price_usd.trim()) {
      const v = Number(form.base_price_usd);
      if (isNaN(v) || v <= 0) e.base_price_usd = "Base price must be a positive number";
    }
    if (form.price_range_min_usd.trim()) {
      const v = Number(form.price_range_min_usd);
      if (isNaN(v) || v <= 0) e.price_range_min_usd = "Min price must be a positive number";
    }
    if (form.price_range_max_usd.trim()) {
      const v = Number(form.price_range_max_usd);
      if (isNaN(v) || v <= 0) e.price_range_max_usd = "Max price must be a positive number";
    }
    if (form.price_range_min_usd.trim() && form.price_range_max_usd.trim()) {
      if (Number(form.price_range_min_usd) > Number(form.price_range_max_usd))
        e.price_range_min_usd = "Min price cannot exceed max price";
    }
    if (form.lead_time_weeks.trim()) {
      const v = Number(form.lead_time_weeks);
      if (isNaN(v) || v <= 0 || !Number.isInteger(v)) e.lead_time_weeks = "Lead time must be a positive integer (weeks)";
    }
    if (form.warranty_months.trim()) {
      const v = Number(form.warranty_months);
      if (isNaN(v) || v <= 0 || !Number.isInteger(v)) e.warranty_months = "Warranty must be a positive integer (months)";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) { show("Fix the errors above before saving", "error"); return; }

    const payload: Record<string, unknown> = {
      financing_available: form.financing_available,
      rental_available:    form.rental_available,
    };
    if (form.base_price_usd.trim())      payload.base_price_usd      = n(form.base_price_usd);
    if (form.price_range_min_usd.trim()) payload.price_range_min_usd = n(form.price_range_min_usd);
    if (form.price_range_max_usd.trim()) payload.price_range_max_usd = n(form.price_range_max_usd);
    if (form.currency)                   payload.currency             = form.currency;
    if (form.incoterms)                  payload.incoterms            = form.incoterms;
    if (form.lead_time_weeks.trim())     payload.lead_time_weeks      = n(form.lead_time_weeks);
    if (form.warranty_months.trim())     payload.warranty_months      = n(form.warranty_months);
    if (form.notes.trim())               payload.notes                = form.notes.trim();

    try {
      await mutate(id, payload as never);
      show("Commercial terms saved!", "success");
      onSaved();
    } catch (err) {
      show(err instanceof Error ? err.message : "Failed to save commercial terms", "error");
    }
  };

  return (
    <>
      {ToastEl}
      <SectionCard title="Commercial Terms" subtitle="Pricing, warranty, lead time and availability">
        <FormGrid cols={3}>
          <Field label="Base Price (USD)" hint="Single published price" error={errors.base_price_usd}>
            <Input type="number" value={form.base_price_usd} onChange={set("base_price_usd") as (v: string) => void}
              placeholder="e.g. 250000" error={errors.base_price_usd} />
          </Field>
          <Field label="Price Range Min (USD)" error={errors.price_range_min_usd}>
            <Input type="number" value={form.price_range_min_usd} onChange={set("price_range_min_usd") as (v: string) => void}
              placeholder="e.g. 220000" error={errors.price_range_min_usd} />
          </Field>
          <Field label="Price Range Max (USD)" error={errors.price_range_max_usd}>
            <Input type="number" value={form.price_range_max_usd} onChange={set("price_range_max_usd") as (v: string) => void}
              placeholder="e.g. 280000" error={errors.price_range_max_usd} />
          </Field>
          <Field label="Currency" hint="3-letter ISO currency code">
            <Select value={form.currency} onChange={set("currency") as (v: string) => void}
              options={[
                { value: "USD", label: "USD — US Dollar" },
                { value: "EUR", label: "EUR — Euro" },
                { value: "GBP", label: "GBP — British Pound" },
                { value: "INR", label: "INR — Indian Rupee" },
                { value: "AED", label: "AED — UAE Dirham" },
              ]} />
          </Field>
          <Field label="Incoterms" hint="International commercial delivery terms">
            <Select value={form.incoterms} onChange={set("incoterms") as (v: string) => void}
              placeholder="Select…"
              options={[
                { value: "EXW", label: "EXW — Ex Works" },
                { value: "FOB", label: "FOB — Free On Board" },
                { value: "CIF", label: "CIF — Cost Insurance Freight" },
                { value: "DAP", label: "DAP — Delivered At Place" },
                { value: "DDP", label: "DDP — Delivered Duty Paid" },
              ]} />
          </Field>
          <Field label="Lead Time (weeks)" hint="Weeks from order to delivery" error={errors.lead_time_weeks}>
            <Input type="number" value={form.lead_time_weeks} onChange={set("lead_time_weeks") as (v: string) => void}
              placeholder="e.g. 16" error={errors.lead_time_weeks} />
          </Field>
          <Field label="Warranty (months)" hint="Warranty duration in months" error={errors.warranty_months}>
            <Input type="number" value={form.warranty_months} onChange={set("warranty_months") as (v: string) => void}
              placeholder="e.g. 12" error={errors.warranty_months} />
          </Field>
          <FormRow>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              <Toggle checked={form.financing_available} onChange={set("financing_available") as (v: boolean) => void} label="Financing Available" />
              <Toggle checked={form.rental_available}    onChange={set("rental_available") as (v: boolean) => void} label="Rental Available" />
            </div>
          </FormRow>
          <FormRow>
            <Field label="Notes">
              <Textarea value={form.notes} onChange={set("notes") as (v: string) => void} rows={3} placeholder="Additional commercial notes…" />
            </Field>
          </FormRow>
        </FormGrid>
        <SaveBtn loading={loading} onClick={handleSave} label="Save Commercial Terms" />
      </SectionCard>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: Dealers
// Backend schema: dealer_name (req), country (req), city, contact_email,
//                 contact_phone, is_authorized, is_service_center
// DB PK: id (NOT dealer_id)
// ─────────────────────────────────────────────────────────────────────────────

const DEALER_COLS = [
  { key: "dealer_name",  label: "Company" },
  { key: "location",     label: "Location" },
  { key: "contact",      label: "Contact" },
  { key: "badges",       label: "Type" },
  { key: "_actions",     label: "", width: 60 },
];

interface DealerFormErrors {
  dealer_name?: string;
  country?: string;
  contact_email?: string;
}

function DealersSection({ spec, onSaved }: { spec: EquipmentSpec; onSaved: () => void }) {
  const { show, ToastEl } = useToast();
  const id = spec.identity.equipment_id;
  const [dealers, setDealers] = useState<Dealer[]>(spec.commercial?.dealers ?? []);
  const [adding, setAdding] = useState(false);
  const [errors, setErrors] = useState<DealerFormErrors>({});
  const [form, setForm] = useState({
    dealer_name: "", country: "", city: "",  // ← dealer_name (NOT company_name)
    contact_email: "", contact_phone: "",
    is_authorized: false, is_service_center: false,
  });
  const [saving, setSaving] = useState(false);

  const set = (k: string) => (v: string | boolean) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k as keyof DealerFormErrors]) setErrors(prev => ({ ...prev, [k]: undefined }));
  };

  const validate = (): boolean => {
    const e: DealerFormErrors = {};
    if (!form.dealer_name.trim()) {
      e.dealer_name = "Dealer name is required (max 150 chars)";
    } else if (form.dealer_name.trim().length > 150) {
      e.dealer_name = "Dealer name must be ≤ 150 characters";
    }
    // country is required per backend schema
    if (!form.country.trim()) {
      e.country = "Country is required";
    } else if (form.country.trim().length > 100) {
      e.country = "Country must be ≤ 100 characters";
    }
    if (form.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email)) {
      e.contact_email = "Invalid email format";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = async () => {
    if (!validate()) { show("Fix the errors above before adding", "error"); return; }
    setSaving(true);
    try {
      const res = await equipmentAPI.commercial.addDealer(id, {
        dealer_name:       form.dealer_name.trim(),   // ← correct backend field
        country:           form.country.trim(),        // ← required
        city:              form.city.trim()            || undefined,
        contact_email:     form.contact_email.trim()  || undefined,
        contact_phone:     form.contact_phone.trim()  || undefined,
        is_authorized:     form.is_authorized,
        is_service_center: form.is_service_center,
      } as never);
      setDealers(d => [...d, res.dealer]);
      setForm({ dealer_name: "", country: "", city: "", contact_email: "", contact_phone: "", is_authorized: false, is_service_center: false });
      setAdding(false);
      setErrors({});
      show(`"${form.dealer_name}" added!`, "success");
      onSaved();
    } catch (err) {
      show(err instanceof Error ? err.message : "Failed to add dealer", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (dealerId: number, dealerName: string) => {
    if (!confirm(`Remove dealer "${dealerName}"?`)) return;
    try {
      await equipmentAPI.commercial.deleteDealer(id, dealerId);
      setDealers(d => d.filter(x => x.id !== dealerId));  // ← use .id not .dealer_id
      show(`"${dealerName}" removed`, "success");
      onSaved();
    } catch (err) {
      show(err instanceof Error ? err.message : "Failed to remove dealer", "error");
    }
  };

  const tableRows = dealers.map(d => ({
    dealer_name: <span style={{ fontWeight: 600 }}>{d.dealer_name}</span>,
    location:    [d.city, d.country].filter(Boolean).join(", ") || "—",
    contact:     d.contact_email ?? d.contact_phone ?? "—",
    badges: (
      <div style={{ display: "flex", gap: 4 }}>
        {d.is_authorized    && <Badge label="Authorized" variant="active" />}
        {d.is_service_center && <Badge label="Service"   variant="draft" />}
      </div>
    ),
    _actions: (
      <IconBtn onClick={() => handleDelete(d.id, d.dealer_name)} danger title="Remove dealer">
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
        title="Dealer Network"
        subtitle="Authorized dealers and service centres"
        action={
          <button onClick={() => { setAdding(a => !a); setErrors({}); }}
            className="btn-secondary" style={{ height: 30, padding: "0 12px", fontSize: 12 }}>
            {adding ? "Cancel" : "+ Add Dealer"}
          </button>
        }
      >
        {adding && (
          <div style={{ background: DASH.surface2, borderRadius: 10, padding: 14, marginBottom: 14, border: `1px solid ${DASH.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: DASH.text }}>New Dealer</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px 12px", marginBottom: 10 }}>
              <Field label="Dealer Name" required error={errors.dealer_name}>
                <Input value={form.dealer_name} onChange={set("dealer_name") as (v: string) => void}
                  placeholder="e.g. Sandvik India Ltd" error={errors.dealer_name} />
              </Field>
              <Field label="Country" required error={errors.country}>
                <Input value={form.country} onChange={set("country") as (v: string) => void}
                  placeholder="e.g. India" error={errors.country} />
              </Field>
              <Field label="City">
                <Input value={form.city} onChange={set("city") as (v: string) => void} placeholder="e.g. Mumbai" />
              </Field>
              <Field label="Contact Email" error={errors.contact_email}>
                <Input type="email" value={form.contact_email} onChange={set("contact_email") as (v: string) => void}
                  placeholder="dealer@example.com" error={errors.contact_email} />
              </Field>
              <Field label="Contact Phone">
                <Input value={form.contact_phone} onChange={set("contact_phone") as (v: string) => void}
                  placeholder="+91 98765 43210" />
              </Field>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "flex-end", paddingBottom: 4 }}>
                <Toggle checked={form.is_authorized}    onChange={set("is_authorized") as (v: boolean) => void}    label="Authorized Dealer" />
                <Toggle checked={form.is_service_center} onChange={set("is_service_center") as (v: boolean) => void} label="Service Centre" />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => { setAdding(false); setErrors({}); setForm({ dealer_name: "", country: "", city: "", contact_email: "", contact_phone: "", is_authorized: false, is_service_center: false }); }}
                className="btn-secondary" style={{ height: 32, padding: "0 14px", fontSize: 12 }}>Cancel</button>
              <button onClick={handleAdd} className="btn-primary" style={{ height: 32, padding: "0 14px", fontSize: 12 }} disabled={saving}>
                {saving ? "Adding…" : "Add Dealer"}
              </button>
            </div>
          </div>
        )}
        <DataTable columns={DEALER_COLS} rows={tableRows} emptyText="No dealers listed yet. Click '+ Add Dealer' to add one." />
      </SectionCard>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: Market Pricing
// Backend schema: region (req, max 100), market_price_usd, price_date (ISO date),
//                 source, notes
// DB PK: id (NOT price_id)
// ─────────────────────────────────────────────────────────────────────────────

const PRICE_COLS = [
  { key: "region",           label: "Region" },
  { key: "market_price_usd", label: "Price (USD)" },
  { key: "price_date",       label: "Date" },
  { key: "source",           label: "Source" },
  { key: "_actions",         label: "", width: 60 },
];

interface PricingErrors {
  region?: string;
  market_price_usd?: string;
  price_date?: string;
}

function PricingSection({ spec, onSaved }: { spec: EquipmentSpec; onSaved: () => void }) {
  const { show, ToastEl } = useToast();
  const id = spec.identity.equipment_id;
  // spec.commercial.market holds pricing_intelligence rows
  const [records, setRecords] = useState<PricingRecord[]>(spec.commercial?.market ?? []);
  const [adding, setAdding] = useState(false);
  const [errors, setErrors] = useState<PricingErrors>({});
  const [form, setForm] = useState({ region: "", market_price_usd: "", price_date: "", source: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const set = (k: string) => (v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k as keyof PricingErrors]) setErrors(prev => ({ ...prev, [k]: undefined }));
  };

  const validate = (): boolean => {
    const e: PricingErrors = {};
    if (!form.region.trim()) {
      e.region = "Region is required (max 100 chars)";
    } else if (form.region.trim().length > 100) {
      e.region = "Region must be ≤ 100 characters";
    }
    if (form.market_price_usd.trim()) {
      const v = Number(form.market_price_usd);
      if (isNaN(v) || v <= 0) e.market_price_usd = "Price must be a positive number";
    }
    if (form.price_date && !/^\d{4}-\d{2}-\d{2}$/.test(form.price_date)) {
      e.price_date = "Date must be in YYYY-MM-DD format";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = async () => {
    if (!validate()) { show("Fix the errors above before adding", "error"); return; }
    setSaving(true);
    try {
      const res = await equipmentAPI.commercial.addPricing(id, {
        region:           form.region.trim(),
        market_price_usd: form.market_price_usd.trim() ? Number(form.market_price_usd) : undefined,
        price_date:       form.price_date || undefined,
        source:           form.source.trim() || undefined,
        notes:            form.notes.trim()  || undefined,
      } as never);
      setRecords(r => [...r, res.record]);
      setForm({ region: "", market_price_usd: "", price_date: "", source: "", notes: "" });
      setAdding(false);
      setErrors({});
      show(`Price record for "${form.region}" added!`, "success");
      onSaved();
    } catch (err) {
      show(err instanceof Error ? err.message : "Failed to add price record", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (priceId: number) => {
    if (!confirm("Delete this price record?")) return;
    try {
      await equipmentAPI.commercial.deletePricing(id, priceId);
      setRecords(r => r.filter(x => x.id !== priceId));  // ← use .id not .price_id
      show("Price record deleted", "success");
      onSaved();
    } catch (err) {
      show(err instanceof Error ? err.message : "Failed to delete price record", "error");
    }
  };

  const tableRows = records.map(r => ({
    region:           <span style={{ fontWeight: 600 }}>{r.region}</span>,
    market_price_usd: r.market_price_usd ? `$${r.market_price_usd.toLocaleString()}` : "—",
    price_date:       r.price_date ? new Date(r.price_date).toLocaleDateString() : "—",
    source:           r.source ?? "—",
    _actions: (
      <IconBtn onClick={() => handleDelete(r.id)} danger title="Delete price record">
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
        title="Market Pricing"
        subtitle="Regional price intelligence data points"
        action={
          <button onClick={() => { setAdding(a => !a); setErrors({}); }}
            className="btn-secondary" style={{ height: 30, padding: "0 12px", fontSize: 12 }}>
            {adding ? "Cancel" : "+ Add Price"}
          </button>
        }
      >
        {adding && (
          <div style={{ background: DASH.surface2, borderRadius: 10, padding: 14, marginBottom: 14, border: `1px solid ${DASH.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: DASH.text }}>New Price Record</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px 12px", marginBottom: 10 }}>
              <Field label="Region" required error={errors.region}>
                <Input value={form.region} onChange={set("region")} placeholder="e.g. India, MENA, Europe" error={errors.region} />
              </Field>
              <Field label="Market Price (USD)" error={errors.market_price_usd}>
                <Input type="number" value={form.market_price_usd} onChange={set("market_price_usd")} placeholder="e.g. 250000" error={errors.market_price_usd} />
              </Field>
              <Field label="Price Date" hint="Format: YYYY-MM-DD" error={errors.price_date}>
                <Input type="date" value={form.price_date} onChange={set("price_date")} error={errors.price_date} />
              </Field>
              <Field label="Source" hint="Where this price was obtained">
                <Input value={form.source} onChange={set("source")} placeholder="e.g. Dealer quote, press release" />
              </Field>
              <div style={{ gridColumn: "span 2" }}>
                <Field label="Notes">
                  <Input value={form.notes} onChange={set("notes")} placeholder="Additional notes…" />
                </Field>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => { setAdding(false); setErrors({}); setForm({ region: "", market_price_usd: "", price_date: "", source: "", notes: "" }); }}
                className="btn-secondary" style={{ height: 32, padding: "0 14px", fontSize: 12 }}>Cancel</button>
              <button onClick={handleAdd} className="btn-primary" style={{ height: 32, padding: "0 14px", fontSize: 12 }} disabled={saving}>
                {saving ? "Adding…" : "Add Price"}
              </button>
            </div>
          </div>
        )}
        <DataTable columns={PRICE_COLS} rows={tableRows} emptyText="No pricing data yet. Click '+ Add Price' to add one." />
      </SectionCard>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Commercial Tab
// ─────────────────────────────────────────────────────────────────────────────

export default function CommercialTab({ spec, onRefresh }: { spec: EquipmentSpec; onRefresh: () => void }) {
  return (
    <div>
      <CommercialTermsSection spec={spec} onSaved={onRefresh} />
      <DealersSection         spec={spec} onSaved={onRefresh} />
      <PricingSection         spec={spec} onSaved={onRefresh} />
    </div>
  );
}