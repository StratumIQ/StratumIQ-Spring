// FILE PATH: frontend/src/components/dashboard/equipment/tabs/IdentityTab.tsx

"use client";

/**
 * IdentityTab — StratumIQ
 * Layer A: Edit equipment identity fields and status after initial creation.
 */

import { useState } from "react";
import { DASH } from "@/lib/constants";
import { equipmentAPI } from "../api/equipment.api";
import { useMutation, useOEMs } from "../hooks/useEquipment";
import {
  Field, Input, Select, Toggle, SaveBtn, SectionCard, FormGrid, FormRow, useToast, Badge,
} from "../shared/EqUI";
import type { EquipmentSpec } from "@/types/equipment";

const STATUS_OPTS = [
  { value: "draft",        label: "Draft" },
  { value: "active",       label: "Active" },
  { value: "discontinued", label: "Discontinued" },
];

interface ValidationErrors {
  brand?: string;
  model_name?: string;
}

export default function IdentityTab({ spec, onRefresh }: { spec: EquipmentSpec; onRefresh: () => void }) {
  const { show, ToastEl } = useToast();
  const { oems } = useOEMs();
  const { mutate: updateEq,     loading: savingFields  } = useMutation(equipmentAPI.update);
  const { mutate: updateStatus, loading: savingStatus } = useMutation(equipmentAPI.updateStatus);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const eq = spec.identity;

  const [form, setForm] = useState({
    oem_id:            String(eq.oem_id ?? ""),
    brand:             eq.brand,
    series:            eq.series            ?? "",
    model_name:        eq.model_name,
    application_stage: eq.application_stage ?? "",
    hard_rock_rated:   eq.hard_rock_rated   ?? false,
    year_introduced:   String(eq.year_introduced ?? ""),
  });
  const [status, setStatus] = useState(eq.status);

  const set = (k: string) => (v: string | boolean) => {
    setForm(f => ({ ...f, [k]: v }));
    // Clear error when field is edited
    if (errors[k as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [k]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    if (!form.brand || form.brand.trim() === "") {
      newErrors.brand = "Brand is required";
    }
    
    if (!form.model_name || form.model_name.trim() === "") {
      newErrors.model_name = "Model name is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveFields = async () => {
    // Validate before saving
    if (!validateForm()) {
      show("Please fix the errors above before saving", "error");
      return;
    }
    
    const payload: Record<string, unknown> = {
      brand:           form.brand.trim(),
      model_name:      form.model_name.trim(),
      hard_rock_rated: form.hard_rock_rated,
    };
    
    // Only add oem_id if it has a valid value
    if (form.oem_id && form.oem_id !== "" && form.oem_id !== "undefined") {
      const oemIdNum = Number(form.oem_id);
      if (!isNaN(oemIdNum) && oemIdNum > 0) {
        payload.oem_id = oemIdNum;
      }
    }
    
    if (form.series && form.series.trim()) {
      payload.series = form.series.trim();
    }
    
    if (form.application_stage && form.application_stage.trim()) {
      payload.application_stage = form.application_stage.trim();
    }
    
    if (form.year_introduced && form.year_introduced !== "") {
      const yearNum = Number(form.year_introduced);
      if (!isNaN(yearNum) && yearNum >= 1900 && yearNum <= new Date().getFullYear() + 5) {
        payload.year_introduced = yearNum;
      } else if (form.year_introduced !== "") {
        show("Year introduced must be between 1900 and " + (new Date().getFullYear() + 5), "error");
        return;
      }
    }

    const res = await updateEq(eq.equipment_id, payload as never);
    if (res) { 
      show("Identity updated successfully!", "success"); 
      onRefresh(); 
    } else {
      show("Failed to save. Please check your inputs and try again.", "error");
    }
  };

  const handleSaveStatus = async () => {
    const res = await updateStatus(eq.equipment_id, status);
    if (res) { 
      show(`Status changed to ${status.toUpperCase()}`, "success"); 
      onRefresh(); 
    } else {
      show("Failed to update status", "error");
    }
  };

  // Map OEM options with proper string values
  const oemOptions = oems.map(o => ({ 
    value: String(o.oem_id), 
    label: o.name 
  }));

  return (
    <>
      {ToastEl}

      {/* Status card */}
      <SectionCard title="Publication Status" subtitle="Controls visibility of this equipment">
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <Select value={status} onChange={setStatus} options={STATUS_OPTS} />
          <Badge label={status} variant={status} />
          <SaveBtn loading={savingStatus} onClick={handleSaveStatus} label="Update Status" />
        </div>
      </SectionCard>

      {/* Identity fields */}
      <SectionCard title="Core Identity" subtitle="Brand, model, type and classification">
        <FormGrid cols={2}>
          <Field label="OEM" hint="Optional - select manufacturer">
            <Select 
              value={form.oem_id} 
              onChange={set("oem_id") as (v: string) => void}
              placeholder="Select OEM…"
              options={oemOptions} 
            />
          </Field>
          
          <Field label="Brand" required error={errors.brand}>
            <Input 
              value={form.brand} 
              onChange={set("brand") as (v: string) => void} 
              placeholder="e.g. Sandvik" 
              required 
            />
          </Field>
          
          <Field label="Series" hint="Optional - product line or series name">
            <Input 
              value={form.series} 
              onChange={set("series") as (v: string) => void} 
              placeholder="e.g. QJ series" 
            />
          </Field>
          
          <Field label="Model Name" required error={errors.model_name}>
            <Input 
              value={form.model_name} 
              onChange={set("model_name") as (v: string) => void} 
              placeholder="e.g. QJ341" 
              required 
            />
          </Field>
          
          <Field label="Application Stage" hint="e.g., Primary, Secondary, Tertiary">
            <Input 
              value={form.application_stage} 
              onChange={set("application_stage") as (v: string) => void} 
              placeholder="e.g. Primary, Secondary" 
            />
          </Field>
          
          <Field label="Year Introduced" hint="Year the model was first released">
            <Input 
              type="number" 
              value={form.year_introduced} 
              onChange={set("year_introduced") as (v: string) => void} 
              placeholder="e.g. 2019" 
            />
          </Field>
          
          <FormRow>
            <Toggle 
              checked={form.hard_rock_rated} 
              onChange={set("hard_rock_rated") as (v: boolean) => void} 
              label="Hard Rock Rated" 
            />
          </FormRow>
        </FormGrid>

        {/* Read-only fields */}
        <div style={{
          marginTop: 16, padding: "12px 14px",
          background: DASH.surface2, borderRadius: 9,
          border: `1px solid ${DASH.border}`,
          display: "flex", gap: 24, flexWrap: "wrap",
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: DASH.text3, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Equipment ID</div>
            <div style={{ fontSize: 13, fontFamily: "monospace", color: DASH.text }}>{eq.equipment_id}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: DASH.text3, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Type</div>
            <div style={{ fontSize: 13, color: DASH.text }}>{eq.equipment_type?.replace(/_/g, " ").toUpperCase() || "—"}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: DASH.text3, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Mobility</div>
            <div style={{ fontSize: 13, color: DASH.text }}>{eq.mobility_type?.replace(/_/g, " ").toUpperCase() || "—"}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: DASH.text3, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Created</div>
            <div style={{ fontSize: 13, color: DASH.text }}>{eq.created_at ? new Date(eq.created_at).toLocaleDateString() : "—"}</div>
          </div>
        </div>
        <div style={{ marginTop: 6, fontSize: 11.5, color: DASH.text3 }}>
          ⚠ Equipment type and mobility cannot be changed after creation.
        </div>

        <SaveBtn loading={savingFields} onClick={handleSaveFields} label="Save Changes" />
      </SectionCard>
    </>
  );
}