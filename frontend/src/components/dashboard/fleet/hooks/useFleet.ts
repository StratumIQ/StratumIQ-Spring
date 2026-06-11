/**
 * Fleet Hooks — StratumIQ
 * Path: frontend/src/components/dashboard/fleet/hooks/useFleet.ts
 *
 * Data-fetching hooks for the fleet module.
 * Each hook handles: loading, error, data, and a refetch trigger.
 * Mutations return { loading, error, mutate } — toast notifications
 * are raised inside each mutate call so errors surface to the user.
 *
 * Pattern mirrors useEquipment.ts from the equipment module.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  FleetEquipment,
  FleetListResponse,
  FleetSummary,
  ServiceRecord,
  OperationLog,
  CreateEquipmentPayload,
  UpdateEquipmentPayload,
  UpdateStatusPayload,
  UpdateHoursPayload,
  ListEquipmentParams,
  CreateServiceRecordPayload,
  UpdateServiceRecordPayload,
  LogOperationPayload,
} from "@/types/fleet";
import {
  registerEquipment,
  listEquipment,
  getFleetSummary,
  getEquipment,
  updateEquipment,
  updateEquipmentStatus,
  updateEquipmentHours,
  deleteEquipment,
  createServiceRecord,
  listServiceRecords,
  updateServiceRecord,
  deleteServiceRecord,
  logOperation,
  listOperations,
} from "../api/fleet.api";

// ── Shared async helper — extracts error message from thrown value ──
function extractError(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong";
}

// ══════════════════════════════════════════════════════════════
// useFleet — paginated equipment list + filters
// ══════════════════════════════════════════════════════════════

export function useFleet(params: ListEquipmentParams = {}) {
  const [data,    setData]    = useState<FleetListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // Stringify params to use as dep — avoids infinite loops from object identity
  const paramKey = JSON.stringify(params);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listEquipment(JSON.parse(paramKey));
      setData(res);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [paramKey]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// ══════════════════════════════════════════════════════════════
// useFleetSummary — overview widget counts
// ══════════════════════════════════════════════════════════════

export function useFleetSummary() {
  const [summary, setSummary] = useState<FleetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFleetSummary();
      setSummary(res.summary);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { summary, loading, error, refetch: fetch };
}

// ══════════════════════════════════════════════════════════════
// useEquipmentDetail — single asset + service counts
// ══════════════════════════════════════════════════════════════

export function useEquipmentDetail(id: number | null) {
  const [equipment, setEquipment] = useState<FleetEquipment | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getEquipment(id);
      setEquipment(res.equipment);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { equipment, loading, error, refetch: fetch };
}

// ══════════════════════════════════════════════════════════════
// useRegisterEquipment — mutation
// ══════════════════════════════════════════════════════════════

export function useRegisterEquipment() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const mutate = async (
    payload:   CreateEquipmentPayload,
    onSuccess: (equipment: FleetEquipment) => void
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await registerEquipment(payload);
      onSuccess(res.equipment);
    } catch (err) {
      const msg = extractError(err);
      setError(msg);
      throw new Error(msg); // re-throw so page can toast
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, mutate };
}

// ══════════════════════════════════════════════════════════════
// useUpdateEquipment — mutation (full/partial field update)
// ══════════════════════════════════════════════════════════════

export function useUpdateEquipment() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const mutate = async (
    id:        number,
    payload:   UpdateEquipmentPayload,
    onSuccess: (equipment: FleetEquipment) => void
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await updateEquipment(id, payload);
      onSuccess(res.equipment);
    } catch (err) {
      const msg = extractError(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, mutate };
}

// ══════════════════════════════════════════════════════════════
// useUpdateStatus — mutation (inline status toggle)
// ══════════════════════════════════════════════════════════════

export function useUpdateStatus() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const mutate = async (
    id:        number,
    payload:   UpdateStatusPayload,
    onSuccess: (equipment: FleetEquipment) => void
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await updateEquipmentStatus(id, payload);
      onSuccess(res.equipment);
    } catch (err) {
      const msg = extractError(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, mutate };
}

// ══════════════════════════════════════════════════════════════
// useUpdateHours — mutation
// ══════════════════════════════════════════════════════════════

export function useUpdateHours() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const mutate = async (
    id:        number,
    payload:   UpdateHoursPayload,
    onSuccess: () => void
  ) => {
    setLoading(true);
    setError(null);
    try {
      await updateEquipmentHours(id, payload);
      onSuccess();
    } catch (err) {
      const msg = extractError(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, mutate };
}

// ══════════════════════════════════════════════════════════════
// useDeleteEquipment — mutation
// ══════════════════════════════════════════════════════════════

export function useDeleteEquipment() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const mutate = async (id: number, onSuccess: () => void) => {
    setLoading(true);
    setError(null);
    try {
      await deleteEquipment(id);
      onSuccess();
    } catch (err) {
      const msg = extractError(err);
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, mutate };
}

// ══════════════════════════════════════════════════════════════
// useServiceRecords — list + mutations
// ══════════════════════════════════════════════════════════════

export function useServiceRecords(equipmentId: number | null) {
  const [records,  setRecords]  = useState<ServiceRecord[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [saving,   setSaving]   = useState(false);
  const [saveErr,  setSaveErr]  = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!equipmentId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await listServiceRecords(equipmentId);
      setRecords(res.records);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [equipmentId]);

  useEffect(() => { fetch(); }, [fetch]);

  const create = async (
    payload:   CreateServiceRecordPayload,
    onSuccess: (record: ServiceRecord) => void
  ) => {
    if (!equipmentId) return;
    setSaving(true);
    setSaveErr(null);
    try {
      const res = await createServiceRecord(equipmentId, payload);
      setRecords(prev => [res.record, ...prev]);
      onSuccess(res.record);
    } catch (err) {
      const msg = extractError(err);
      setSaveErr(msg);
      throw new Error(msg);
    } finally {
      setSaving(false);
    }
  };

  const update = async (
    recordId:  number,
    payload:   UpdateServiceRecordPayload,
    onSuccess: (record: ServiceRecord) => void
  ) => {
    if (!equipmentId) return;
    setSaving(true);
    setSaveErr(null);
    try {
      const res = await updateServiceRecord(equipmentId, recordId, payload);
      setRecords(prev => prev.map(r => r.id === recordId ? res.record : r));
      onSuccess(res.record);
    } catch (err) {
      const msg = extractError(err);
      setSaveErr(msg);
      throw new Error(msg);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (recordId: number, onSuccess: () => void) => {
    if (!equipmentId) return;
    setSaving(true);
    setSaveErr(null);
    try {
      await deleteServiceRecord(equipmentId, recordId);
      setRecords(prev => prev.filter(r => r.id !== recordId));
      onSuccess();
    } catch (err) {
      const msg = extractError(err);
      setSaveErr(msg);
      throw new Error(msg);
    } finally {
      setSaving(false);
    }
  };

  return { records, loading, error, saving, saveErr, refetch: fetch, create, update, remove };
}

// ══════════════════════════════════════════════════════════════
// useOperations — list + log mutation
// ══════════════════════════════════════════════════════════════

export function useOperations(equipmentId: number | null) {
  const [operations, setOperations] = useState<OperationLog[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [saving,     setSaving]     = useState(false);
  const [saveErr,    setSaveErr]    = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!equipmentId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await listOperations(equipmentId);
      setOperations(res.operations);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }, [equipmentId]);

  useEffect(() => { fetch(); }, [fetch]);

  const log = async (
    payload:   LogOperationPayload,
    onSuccess: () => void
  ) => {
    if (!equipmentId) return;
    setSaving(true);
    setSaveErr(null);
    try {
      const res = await logOperation(equipmentId, payload);
      setOperations(prev => [res.operation, ...prev]);
      onSuccess();
    } catch (err) {
      const msg = extractError(err);
      setSaveErr(msg);
      throw new Error(msg);
    } finally {
      setSaving(false);
    }
  };

  return { operations, loading, error, saving, saveErr, refetch: fetch, log };
}