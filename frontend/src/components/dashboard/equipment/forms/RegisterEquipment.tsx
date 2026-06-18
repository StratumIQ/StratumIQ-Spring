"use client";

/**
 * RegisterEquipmentForm — StratumIQ
 * Creates a new equipment identity record (Layer A).
 * Used on /dashboard/equipment/new.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DASH } from "@/lib/constants";
import { equipmentApi as equipmentAPI } from "@/lib/api/equipment";
import { useOEMs } from "../hooks/useEquipment";
import {
  Field, Input, Select, Toggle, SaveBtn, SectionCard, FormGrid, FormRow, useToast,
} from "../shared/EqUI";
import type { EquipmentType, MobilityType } from "@/types/equipment";

const EQUIPMENT_TYPES = [
  { value: "jaw_crusher",      label: "Jaw Crusher" },
  { value: "cone_crusher",     label: "Cone Crusher" },
  { value: "hsi_crusher",      label: "HSI Crusher" },
  { value: "vsi_crusher",      label: "VSI Crusher" },
  { value: "gyratory_crusher", label: "Gyratory Crusher" },
  { value: "screen",           label: "Screen" },
  { value: "feeder",           label: "Feeder" },
  { value: "conveyor",         label: "Conveyor" },
];

const MOBILITY_TYPES = [
  { value: "static",   label: "Static" },
  { value: "track",    label: "Track-mounted" },
  { value: "wheel",    label: "Wheel-mounted" },
  { value: "portable", label: "Portable" },
  { value: "modular",  label: "Modular" },
];

const STATUS_OPTS = [
  { value: "draft",        label: "Draft" },
  { value: "active",       label: "Active" },
  { value: "discontinued", label: "Discontinued" },
];

export default function RegisterEquipmentForm() {
  const router = useRouter();
  const { oems } = useOEMs();
  const { show, ToastEl } = useToast();

  const [saving,  setSaving]  = useState(false);
  const [form, setForm] = useState({
    equipment_id:      "",
    oem_id:            "",
    brand:             "",
    series:            "",
    model_name:        "",
    equipment_type:    "" as EquipmentType | "",
    mobility_type:     "" as MobilityType | "",
    application_stage: "",
    hard_rock_rated:   false,
    year_introduced:   "",
    status:            "draft",
  });

  const set = (key: string) => (val: string | boolean) =>
    setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (!form.brand || !form.model_name || !form.equipment_type || !form.mobility_type) {
      show("Brand, model, type and mobility are required", "error");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        brand:          form.brand,
        model_name:     form.model_name,
        equipment_type: form.equipment_type,
        mobility_type:  form.mobility_type,
        status:         form.status,
        hard_rock_rated: form.hard_rock_rated,
      };
      
      if (form.equipment_id && form.equipment_id.trim()) {
        payload.equipment_id = form.equipment_id.trim();
      }
      
      // IMPORTANT: Only add oem_id if it has a valid value (not empty string)
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
        if (!isNaN(yearNum) && yearNum > 1900) {
          payload.year_introduced = yearNum;
        }
      }

      console.log("Submitting payload:", payload); // Debug log

      const res = await equipmentAPI.create(payload as never);
      show("Equipment registered!");
      setTimeout(() => router.push(`/dashboard/equipment/${res.equipment_id}/edit`), 800);
    } catch (e) {
      console.error("Registration error:", e);
      show(e instanceof Error ? e.message : "Failed to register", "error");
    } finally {
      setSaving(false);
    }
  };

  // Map OEMs for Select component - ensure value is string
  const oemOptions = oems.map(o => ({ 
    value: String(o.oem_id), 
    label: o.name 
  }));

  return (
    <div style={{ maxWidth: 760 }}>
      {ToastEl}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: DASH.text, letterSpacing: "-0.03em", marginBottom: 4 }}>
          Register New Equipment
        </h1>
        <p style={{ fontSize: 13.5, color: DASH.text3 }}>
          Enter the identity fields first. You can add technical specs, commercial data, and media after saving.
        </p>
      </div>

      <SectionCard title="Identity" subtitle="Core identification fields">
        <FormGrid cols={2}>
          <Field label="Equipment ID" hint="Leave blank to auto-generate (e.g. JC-SB-110)">
            <Input value={form.equipment_id} onChange={set("equipment_id")} placeholder="e.g. JC-SB-110" />
          </Field>
          <Field label="OEM">
            <Select
              value={form.oem_id}
              onChange={set("oem_id")}
              placeholder="Select OEM…"
              options={oemOptions}
            />
          </Field>

          <Field label="Brand" required>
            <Input value={form.brand} onChange={set("brand")} placeholder="e.g. Sandvik" required />
          </Field>
          <Field label="Series">
            <Input value={form.series} onChange={set("series")} placeholder="e.g. QJ series" />
          </Field>

          <Field label="Model Name" required>
            <Input value={form.model_name} onChange={set("model_name")} placeholder="e.g. QJ341" required />
          </Field>
          <Field label="Application Stage">
            <Input value={form.application_stage} onChange={set("application_stage")} placeholder="e.g. Primary, Secondary" />
          </Field>

          <Field label="Equipment Type" required>
            <Select
              value={form.equipment_type}
              onChange={set("equipment_type")}
              placeholder="Select type…"
              options={EQUIPMENT_TYPES}
            />
          </Field>
          <Field label="Mobility Type" required>
            <Select
              value={form.mobility_type}
              onChange={set("mobility_type")}
              placeholder="Select mobility…"
              options={MOBILITY_TYPES}
            />
          </Field>

          <Field label="Year Introduced">
            <Input type="number" value={form.year_introduced} onChange={set("year_introduced")} placeholder="e.g. 2019" />
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={set("status")} options={STATUS_OPTS} />
          </Field>

          <FormRow>
            <Toggle checked={form.hard_rock_rated} onChange={set("hard_rock_rated") as (v: boolean) => void} label="Hard Rock Rated" />
          </FormRow>
        </FormGrid>

        <SaveBtn loading={saving} onClick={handleSubmit} label="Register Equipment →" />
      </SectionCard>
    </div>
  );
}