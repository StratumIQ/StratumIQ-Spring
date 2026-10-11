"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { partsApi, type NamedMaster, type PartCategory } from "@/lib/api/parts";

type MasterKind = "categories" | "brands" | "manufacturers" | "units";
type MasterRecord = NamedMaster | PartCategory;

const LABELS: Record<MasterKind, string> = { categories: "Categories", brands: "Brands", manufacturers: "Manufacturers", units: "Units of measure" };

function actions(kind: MasterKind) {
  switch (kind) {
    case "categories": return { create: partsApi.masters.createCategory, update: partsApi.masters.updateCategory, archive: partsApi.masters.archiveCategory };
    case "brands": return { create: partsApi.masters.createBrand, update: partsApi.masters.updateBrand, archive: partsApi.masters.archiveBrand };
    case "manufacturers": return { create: partsApi.masters.createManufacturer, update: partsApi.masters.updateManufacturer, archive: partsApi.masters.archiveManufacturer };
    case "units": return { create: partsApi.masters.createUnit, update: partsApi.masters.updateUnit, archive: partsApi.masters.archiveUnit };
  }
}

export default function MasterDataManager() {
  const client = useQueryClient();
  const [kind, setKind] = useState<MasterKind>("categories");
  const [draft, setDraft] = useState({ name: "", description: "", symbol: "" });
  const [editing, setEditing] = useState<MasterRecord | null>(null);
  const queryKey = useMemo(() => ["part-master-admin", kind], [kind]);
  const query = useQuery({ queryKey, queryFn: () => {
    if (kind === "categories") return partsApi.masters.categories(true);
    if (kind === "brands") return partsApi.masters.brands(true);
    if (kind === "manufacturers") return partsApi.masters.manufacturers(true);
    return partsApi.masters.units(true);
  } });
  const refresh = () => {
    client.invalidateQueries({ queryKey });
    client.invalidateQueries({ queryKey: ["part-categories"] });
    client.invalidateQueries({ queryKey: ["part-brands"] });
    client.invalidateQueries({ queryKey: ["part-manufacturers"] });
    client.invalidateQueries({ queryKey: ["part-units"] });
  };
  const create = useMutation({ mutationFn: () => actions(kind).create({ name: draft.name.trim(), description: draft.description.trim() || undefined, symbol: draft.symbol.trim() || undefined }), onSuccess: () => { setDraft({ name: "", description: "", symbol: "" }); refresh(); toast.success(`${LABELS[kind].slice(0, -1)} created`); }, onError: (e: Error) => toast.error(e.message) });
  const update = useMutation({ mutationFn: () => {
    if (!editing) throw new Error("No item to update");
    return actions(kind).update(editing.id, {
      name: editing.name.trim(),
      description: editing.description?.trim() || undefined,
      symbol: "symbol" in editing && typeof editing.symbol === "string" ? editing.symbol.trim() || undefined : undefined
    });
  }, onSuccess: () => { setEditing(null); refresh(); toast.success("Master data updated"); }, onError: (e: Error) => toast.error(e.message) });
  const archive = useMutation({ mutationFn: (id: number) => actions(kind).archive(id), onSuccess: () => { refresh(); toast.success("Item archived"); }, onError: (e: Error) => toast.error(e.message) });
  const items = (query.data ?? []) as MasterRecord[];

  return <section className="d-part-panel" style={{ marginTop: 20 }}>
    <div className="d-part-master-head"><div><h3>Catalog master data</h3><p>Maintain the values used by part listings.</p></div><select className="dash-input" value={kind} onChange={(e) => { setKind(e.target.value as MasterKind); setEditing(null); }}><option value="categories">Categories</option><option value="brands">Brands</option><option value="manufacturers">Manufacturers</option><option value="units">Units of measure</option></select></div>
    <div className="d-part-master-create"><input className="dash-input" placeholder="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /> <input className="dash-input" placeholder="Description (optional)" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /> {kind === "units" && <input className="dash-input" placeholder="Symbol" value={draft.symbol} onChange={(e) => setDraft({ ...draft, symbol: e.target.value })} />}<button className="admin-btn admin-btn-primary" disabled={!draft.name.trim() || create.isPending} onClick={() => create.mutate()}><Plus size={15} /> Add</button></div>
    {query.isLoading ? <p>Loading {LABELS[kind].toLowerCase()}…</p> : <div className="d-part-master-list">{items.map((item) => <div key={item.id} className="d-part-master-row">
      {editing?.id === item.id ? <><input className="dash-input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /><input className="dash-input" value={editing.description ?? ""} placeholder="Description" onChange={(e) => setEditing({ ...editing, description: e.target.value })} /><button className="admin-btn admin-btn-primary" onClick={() => update.mutate()} disabled={update.isPending}>Save</button><button className="admin-btn admin-btn-ghost" onClick={() => setEditing(null)}><X size={15} /></button></> : <><div><strong>{item.name}</strong>{item.description && <small>{item.description}</small>}</div><span className={item.active ? "d-part-active" : "d-part-muted"}>{item.active ? "Active" : "Archived"}</span><button className="admin-btn admin-btn-ghost" onClick={() => setEditing(item)} title="Edit"><Pencil size={15} /></button><button className="admin-btn admin-btn-ghost" disabled={!item.active || archive.isPending} onClick={() => { if (window.confirm(`Archive ${item.name}?`)) archive.mutate(item.id); }} title="Archive"><Trash2 size={15} /></button></>}
    </div>)}</div>}
  </section>;
}
