"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/dashboard/ui/Button";
import PartImageManager from "@/components/dashboard/parts/PartImageManager";
import {
  partsApi,
  type NamedMaster,
  type Part,
  type PartAttribute,
  type PartCategory,
  type PartCondition,
  type PartImage,
  type PartStatus,
  type PartType,
  type PartWritePayload,
} from "@/lib/api/parts";

type Props = {
  initial?: Part | null;
  mode: "dealer" | "admin";
  submitting?: boolean;
  onSubmit: (payload: PartWritePayload) => void;
  onCancel: () => void;
};

const TYPES: PartType[] = ["OEM", "AFTERMARKET", "GENUINE", "REPLACEMENT"];
const CONDITIONS: PartCondition[] = ["NEW", "REFURBISHED", "USED"];
const STATUSES: PartStatus[] = ["DRAFT", "ACTIVE", "OUT_OF_STOCK", "DISCONTINUED", "ARCHIVED"];

export default function PartForm({ initial, mode, submitting, onSubmit, onCancel }: Props) {
  const admin = mode === "admin";
  const { data: categories = [] } = useQuery({
    queryKey: ["part-categories", admin],
    queryFn: () => partsApi.masters.categories(admin),
  });
  const { data: brands = [] } = useQuery({
    queryKey: ["part-brands", admin],
    queryFn: () => partsApi.masters.brands(admin),
  });
  const { data: manufacturers = [] } = useQuery({
    queryKey: ["part-manufacturers", admin],
    queryFn: () => partsApi.masters.manufacturers(admin),
  });
  const { data: units = [] } = useQuery({
    queryKey: ["part-units", admin],
    queryFn: () => partsApi.masters.units(admin),
  });
  const { data: dealers } = useQuery({
    queryKey: ["admin-dealers"],
    queryFn: async () => {
      const { adminApi } = await import("@/services/admin/adminClient");
      return adminApi.listUsers({ role: "DEALER", limit: 100, page: 1 }) as Promise<{
        users: Array<{ id: number; firstName: string; lastName: string; email: string }>;
      }>;
    },
    enabled: admin,
  });

  const [partNumber, setPartNumber] = useState(initial?.partNumber ?? "");
  const [partName, setPartName] = useState(initial?.partName ?? "");
  const [sku, setSku] = useState(initial?.sku ?? "");
  const [oemNumber, setOemNumber] = useState(initial?.oemNumber ?? "");
  const [categoryId, setCategoryId] = useState(String(initial?.categoryId ?? ""));
  const [brandId, setBrandId] = useState(String(initial?.brandId ?? ""));
  const [manufacturerId, setManufacturerId] = useState(String(initial?.manufacturerId ?? ""));
  const [unitOfMeasureId, setUnitOfMeasureId] = useState(String(initial?.unitOfMeasureId ?? ""));
  const [dealerId, setDealerId] = useState(String(initial?.dealerId ?? ""));
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [discountPrice, setDiscountPrice] = useState(String(initial?.discountPrice ?? ""));
  const [quantity, setQuantity] = useState(String(initial?.quantity ?? "0"));
  const [partType, setPartType] = useState<PartType | "">(initial?.partType ?? "AFTERMARKET");
  const [partCondition, setPartCondition] = useState<PartCondition | "">(initial?.partCondition ?? "NEW");
  const [status, setStatus] = useState<PartStatus>(initial?.status ?? "ACTIVE");
  const [warranty, setWarranty] = useState(initial?.warranty ?? "");
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [weight, setWeight] = useState(String(initial?.weight ?? ""));
  const [length, setLength] = useState(String(initial?.length ?? ""));
  const [width, setWidth] = useState(String(initial?.width ?? ""));
  const [height, setHeight] = useState(String(initial?.height ?? ""));
  const [featured, setFeatured] = useState(Boolean(initial?.featured));
  const [tags, setTags] = useState(initial?.tags ?? "");
  const [images, setImages] = useState<PartImage[]>(initial?.images ?? []);
  const [attributes, setAttributes] = useState<PartAttribute[]>(
    initial?.attributes?.length ? initial.attributes : [{ name: "", value: "" }],
  );
  const [error, setError] = useState<string | null>(null);

  const parents = useMemo(
    () => (categories as PartCategory[]).filter((c) => !c.parentId),
    [categories],
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!partName.trim() || !categoryId || !unitOfMeasureId || !price) {
      setError("Name, category, unit, and price are required.");
      return;
    }
    if (!initial && !partNumber.trim()) {
      setError("Part number is required.");
      return;
    }
    if (admin && !initial && !dealerId) {
      setError("Select a dealer for this listing.");
      return;
    }
    const payload: PartWritePayload = {
      partName: partName.trim(),
      categoryId: Number(categoryId),
      unitOfMeasureId: Number(unitOfMeasureId),
      currency: "INR",
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      quantity: Number(quantity || 0),
      sku: sku.trim() || undefined,
      oemNumber: oemNumber.trim() || undefined,
      brandId: brandId ? Number(brandId) : null,
      manufacturerId: manufacturerId ? Number(manufacturerId) : null,
      partType: partType || null,
      partCondition: partCondition || null,
      status,
      warranty: warranty.trim() || undefined,
      shortDescription: shortDescription.trim() || undefined,
      description: description.trim() || undefined,
      weight: weight ? Number(weight) : null,
      length: length ? Number(length) : null,
      width: width ? Number(width) : null,
      height: height ? Number(height) : null,
      featured,
      tags: tags.trim() || undefined,
      images,
      attributes: attributes.filter((a) => a.name.trim() && a.value.trim()),
    };
    if (!initial) payload.partNumber = partNumber.trim();
    if (admin && dealerId) payload.dealerId = Number(dealerId);
    onSubmit(payload);
  };

  return (
    <form onSubmit={submit} className="d-part-panel">
      {error && <p className="d-image-upload-error" style={{ marginBottom: 12 }}>{error}</p>}
      <div className="d-part-form-grid">
        {!initial && (
          <label className="d-part-label">
            Part number *
            <input className="dash-input" value={partNumber} onChange={(e) => setPartNumber(e.target.value)} required />
          </label>
        )}
        <label className="d-part-label">
          Name *
          <input className="dash-input" value={partName} onChange={(e) => setPartName(e.target.value)} required />
        </label>
        <label className="d-part-label">
          SKU
          <input className="dash-input" value={sku} onChange={(e) => setSku(e.target.value)} />
        </label>
        <label className="d-part-label">
          OEM number
          <input className="dash-input" value={oemNumber} onChange={(e) => setOemNumber(e.target.value)} />
        </label>
        <label className="d-part-label">
          Category *
          <select className="dash-input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
            <option value="">Select…</option>
            {parents.map((p) => (
              <optgroup key={p.id} label={p.name}>
                <option value={p.id}>{p.name}</option>
                {(categories as PartCategory[])
                  .filter((c) => c.parentId === p.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>
        <label className="d-part-label">
          Brand
          <select className="dash-input" value={brandId} onChange={(e) => setBrandId(e.target.value)}>
            <option value="">None</option>
            {(brands as NamedMaster[]).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </label>
        <label className="d-part-label">
          Manufacturer
          <select className="dash-input" value={manufacturerId} onChange={(e) => setManufacturerId(e.target.value)}>
            <option value="">None</option>
            {(manufacturers as NamedMaster[]).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </label>
        <label className="d-part-label">
          Unit *
          <select className="dash-input" value={unitOfMeasureId} onChange={(e) => setUnitOfMeasureId(e.target.value)} required>
            <option value="">Select…</option>
            {(units as NamedMaster[]).map((u) => <option key={u.id} value={u.id}>{u.name}{u.symbol ? ` (${u.symbol})` : ""}</option>)}
          </select>
        </label>
        {admin && (
          <label className="d-part-label">
            Dealer *
            <select className="dash-input" value={dealerId} onChange={(e) => setDealerId(e.target.value)} required={!initial} disabled={Boolean(initial)}>
              <option value="">Select dealer…</option>
              {(dealers?.users ?? []).map((u) => (
                <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
              ))}
            </select>
          </label>
        )}
        <label className="d-part-label">
          Price (INR) *
          <input className="dash-input" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </label>
        <label className="d-part-label">
          Offer price
          <input className="dash-input" type="number" min="0" step="0.01" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} />
        </label>
        <label className="d-part-label">
          Quantity
          <input className="dash-input" type="number" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </label>
        <label className="d-part-label">
          Type
          <select className="dash-input" value={partType} onChange={(e) => setPartType(e.target.value as PartType)}>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="d-part-label">
          Condition
          <select className="dash-input" value={partCondition} onChange={(e) => setPartCondition(e.target.value as PartCondition)}>
            {CONDITIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="d-part-label">
          Status
          <select className="dash-input" value={status} onChange={(e) => setStatus(e.target.value as PartStatus)}>
            {STATUSES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label className="d-part-label">
          Warranty
          <input className="dash-input" value={warranty} onChange={(e) => setWarranty(e.target.value)} placeholder="e.g. 6 months" />
        </label>
        <label className="d-part-label">Weight (kg)<input className="dash-input" type="number" min="0" step="0.01" value={weight} onChange={(e) => setWeight(e.target.value)} /></label>
        <label className="d-part-label">Length<input className="dash-input" type="number" min="0" step="0.01" value={length} onChange={(e) => setLength(e.target.value)} /></label>
        <label className="d-part-label">Width<input className="dash-input" type="number" min="0" step="0.01" value={width} onChange={(e) => setWidth(e.target.value)} /></label>
        <label className="d-part-label">Height<input className="dash-input" type="number" min="0" step="0.01" value={height} onChange={(e) => setHeight(e.target.value)} /></label>
        <label className="d-part-label full">
          Short description
          <input className="dash-input" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} maxLength={500} />
        </label>
        <label className="d-part-label full">
          Description
          <textarea className="dash-input" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label className="d-part-label full">
          Tags
          <input className="dash-input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="wear, jaw, liner" />
        </label>
        <label className="d-part-label" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          Featured listing
        </label>
        <div className="full">
          <div className="d-part-label" style={{ marginBottom: 8 }}>Images</div>
          <PartImageManager images={images} onChange={setImages} />
        </div>
        <div className="full">
          <div className="d-part-label" style={{ marginBottom: 8 }}>Technical attributes</div>
          {attributes.map((row, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 8, marginBottom: 8 }}>
              <input className="dash-input" placeholder="e.g. Material" value={row.name} onChange={(e) => {
                const next = [...attributes];
                next[i] = { ...row, name: e.target.value };
                setAttributes(next);
              }} />
              <input className="dash-input" placeholder="e.g. High-chrome" value={row.value} onChange={(e) => {
                const next = [...attributes];
                next[i] = { ...row, value: e.target.value };
                setAttributes(next);
              }} />
              <Button variant="ghost" size="sm" onClick={() => setAttributes(attributes.filter((_, idx) => idx !== i))}>Remove</Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={() => setAttributes([...attributes, { name: "", value: "" }])}>Add attribute</Button>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
        <Button variant="outline" onClick={onCancel} type="button">Cancel</Button>
        <Button type="submit" loading={submitting}>{initial ? "Save changes" : "Create listing"}</Button>
      </div>
    </form>
  );
}
