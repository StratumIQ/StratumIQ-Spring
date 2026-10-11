"use client";

import { useRef, useState } from "react";
import { Download, FileUp, X } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/dashboard/ui/Button";
import {
  partsApi,
  type NamedMaster,
  type Part,
  type PartCategory,
  type PartCondition,
  type PartStatus,
  type PartType,
  type PartWritePayload,
} from "@/lib/api/parts";

type Mode = "dealer" | "admin";
type Props = { mode: Mode; parts: Part[]; onImported: () => void };
type Row = Record<string, string>;

const HEADERS = ["partNumber", "partName", "category", "unit", "price", "quantity", "sku", "oemNumber", "brand", "manufacturer", "partType", "partCondition", "status", "warranty", "shortDescription", "description", "tags", "discountPrice", "weight", "length", "width", "height", "featured", "dealerId"];
const STATUSES = new Set<PartStatus>(["DRAFT", "ACTIVE", "OUT_OF_STOCK", "DISCONTINUED", "ARCHIVED"]);
const TYPES = new Set<PartType>(["OEM", "AFTERMARKET", "GENUINE", "REPLACEMENT"]);
const CONDITIONS = new Set<PartCondition>(["NEW", "REFURBISHED", "USED"]);

function csvRows(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let value = ""; let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]; const next = text[i + 1];
    if (char === '"' && quoted && next === '"') { value += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(value.trim()); value = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) { if (char === "\r" && next === "\n") i += 1; row.push(value.trim()); if (row.some(Boolean)) rows.push(row); row = []; value = ""; }
    else value += char;
  }
  row.push(value.trim()); if (row.some(Boolean)) rows.push(row);
  return rows;
}

function escape(value: unknown) { const text = String(value ?? ""); return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text; }
function download(name: string, content: string) { const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" })); const link = document.createElement("a"); link.href = url; link.download = name; link.click(); URL.revokeObjectURL(url); }
function optionalNumber(value: string | undefined) { return value?.trim() ? Number(value) : undefined; }

export default function PartCsvTransfer({ mode, parts, onImported }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false); const [rows, setRows] = useState<Row[]>([]); const [errors, setErrors] = useState<string[]>([]); const [importing, setImporting] = useState(false);
  const admin = mode === "admin";
  const masters = Promise.all([partsApi.masters.categories(admin), partsApi.masters.brands(admin), partsApi.masters.manufacturers(admin), partsApi.masters.units(admin)]);

  const exportTemplate = () => download("stratumiq-parts-template.csv", `${HEADERS.join(",")}\nJAW-001,Jaw plate,Jaw Crusher Parts,Piece,12500,10,,,,AFTERMARKET,NEW,DRAFT,6 months,High-wear jaw plate,,,12000,25,110,15,false,${admin ? "42" : ""}\n`);
  const exportParts = () => {
    const lines = [HEADERS.join(","), ...parts.map((part) => HEADERS.map((header) => escape({
      partNumber: part.partNumber, partName: part.partName, category: part.categoryName, unit: part.unitName ?? part.unitSymbol, price: part.price, quantity: part.quantity,
      sku: part.sku, oemNumber: part.oemNumber, brand: part.brandName, manufacturer: part.manufacturerName, partType: part.partType, partCondition: part.partCondition,
      status: part.status, warranty: part.warranty, shortDescription: part.shortDescription, description: part.description, tags: part.tags, discountPrice: part.discountPrice,
      weight: part.weight, length: part.length, width: part.width, height: part.height, featured: part.featured, dealerId: part.dealerId,
    }[header])).join(","))];
    download("stratumiq-parts-export.csv", lines.join("\n"));
  };
  const read = async (file: File) => {
    const data = csvRows(await file.text()); const headers = data.shift()?.map((header) => header.trim().toLowerCase());
    if (!headers?.length || !headers.includes("partnumber") || !headers.includes("partname")) { setErrors(["The CSV must include partNumber and partName columns."]); return; }
    setRows(data.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])))); setErrors([]);
  };
  const importRows = async () => {
    if (!rows.length) return;
    setImporting(true); setErrors([]);
    try {
      const [categories, brands, manufacturers, units] = await masters as [PartCategory[], NamedMaster[], NamedMaster[], NamedMaster[]];
      const byName = <T extends { name: string }>(items: T[], value: string) => items.find((item) => item.name.trim().toLowerCase() === value.trim().toLowerCase());
      const payloads = rows.map((row, index) => {
        const category = byName(categories, row.category); const unit = byName(units, row.unit);
        const brand = row.brand ? byName(brands, row.brand) : undefined;
        const manufacturer = row.manufacturer ? byName(manufacturers, row.manufacturer) : undefined;
        const price = Number(row.price); const quantity = row.quantity ? Number(row.quantity) : 0;
        const status = (row.status || "DRAFT").toUpperCase() as PartStatus;
        const type = row.parttype?.toUpperCase() as PartType | undefined; const condition = row.partcondition?.toUpperCase() as PartCondition | undefined;
        if (!row.partnumber || !row.partname || !category || !unit || !row.price?.trim() || !Number.isFinite(price) || price < 0 || !Number.isInteger(quantity) || quantity < 0) throw new Error(`Row ${index + 2}: partNumber, partName, valid category, unit, non-negative price, and whole quantity are required.`);
        if ((row.brand && !brand) || (row.manufacturer && !manufacturer)) throw new Error(`Row ${index + 2}: brand or manufacturer does not match an active master-data item.`);
        if (!STATUSES.has(status) || (type && !TYPES.has(type)) || (condition && !CONDITIONS.has(condition))) throw new Error(`Row ${index + 2}: invalid status, partType, or partCondition.`);
        const dealerId = optionalNumber(row.dealerid); if (admin && (!dealerId || !Number.isInteger(dealerId))) throw new Error(`Row ${index + 2}: dealerId is required for admin imports.`);
        const discountPrice = optionalNumber(row.discountprice); const optionalValues = [discountPrice, optionalNumber(row.weight), optionalNumber(row.length), optionalNumber(row.width), optionalNumber(row.height)];
        if (optionalValues.some((value) => value !== undefined && (!Number.isFinite(value) || value < 0))) throw new Error(`Row ${index + 2}: optional numeric values must be non-negative numbers.`);
        return {
          partNumber: row.partnumber.trim(), partName: row.partname.trim(), categoryId: category.id, unitOfMeasureId: unit.id, currency: "INR", price, quantity,
          brandId: brand?.id ?? null, manufacturerId: manufacturer?.id ?? null,
          sku: row.sku || undefined, oemNumber: row.oemnumber || undefined, partType: type, partCondition: condition, status, warranty: row.warranty || undefined,
          shortDescription: row.shortdescription || undefined, description: row.description || undefined, tags: row.tags || undefined, discountPrice,
          weight: optionalNumber(row.weight) ?? null, length: optionalNumber(row.length) ?? null, width: optionalNumber(row.width) ?? null, height: optionalNumber(row.height) ?? null,
          featured: row.featured?.toLowerCase() === "true", dealerId,
        } satisfies PartWritePayload;
      });
      for (const payload of payloads) { if (admin) await partsApi.admin.create(payload); else await partsApi.dealer.create(payload); }
      toast.success(`${payloads.length} part ${payloads.length === 1 ? "listing" : "listings"} imported as drafts.`); onImported(); setRows([]); setOpen(false);
    } catch (error) { setErrors([error instanceof Error ? error.message : "Import failed."]); }
    finally { setImporting(false); }
  };

  return <>
    <Button variant="outline" size="sm" icon={<Download size={14} />} onClick={exportParts} disabled={!parts.length}>Export displayed</Button>
    <Button variant="outline" size="sm" icon={<FileUp size={14} />} onClick={() => setOpen(true)}>Import CSV</Button>
    {open && <div className="d-part-import-backdrop" role="dialog" aria-modal="true" aria-label="Import part listings"><div className="d-part-import-dialog">
      <button type="button" className="d-part-import-close" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button><h3>Import part listings</h3>
      <p>Download the template, fill it in, then upload it. Category, brand, manufacturer, and unit values must match the master-data names exactly. Imports start as drafts unless a valid status is supplied.</p>
      {admin && <p><strong>Admin import:</strong> every row must include the numeric <code>dealerId</code> of the listing owner.</p>}
      <div className="d-part-import-actions"><Button variant="outline" size="sm" onClick={exportTemplate}>Download template</Button><Button size="sm" onClick={() => input.current?.click()} icon={<FileUp size={14} />}>Choose CSV</Button><input ref={input} hidden type="file" accept=".csv,text/csv" onChange={(e) => { const file = e.target.files?.[0]; if (file) void read(file); e.target.value = ""; }} /></div>
      {!!rows.length && <p className="d-part-import-ready">{rows.length} row{rows.length === 1 ? "" : "s"} ready to import.</p>}
      {!!errors.length && <div className="d-image-upload-error">{errors.map((error) => <div key={error}>{error}</div>)}</div>}
      <div className="d-part-import-actions"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button loading={importing} disabled={!rows.length} onClick={() => void importRows()}>Import listings</Button></div>
    </div></div>}
  </>;
}
