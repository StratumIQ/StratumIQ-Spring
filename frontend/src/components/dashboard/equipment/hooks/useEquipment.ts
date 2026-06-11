/**
 * useEquipment — StratumIQ
 * Central hook for all equipment data operations.
 * Keeps API calls, loading states, and mutations in one place.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { equipmentAPI } from "../api/equipment.api";
import type {
  EquipmentSpec, EquipmentListItem, OEM, EquipmentListQuery,
} from "@/types/equipment";

// ── List hook ────────────────────────────────────────────────────────────────

export function useEquipmentList(initialQuery: EquipmentListQuery = {}) {
  const [items,   setItems]   = useState<EquipmentListItem[]>([]);
  const [total,   setTotal]   = useState(0);
  const [pages,   setPages]   = useState(1);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [query,   setQuery]   = useState<EquipmentListQuery>({ page: 1, limit: 20, ...initialQuery });

  // Use a string key so useCallback has a stable dep
  const queryKey = JSON.stringify(query);

  const loadList = useCallback(async (q: EquipmentListQuery) => {
    setLoading(true);
    setError(null);
    try {
      const res = await equipmentAPI.list(q);
      // Backend returns { data, total, pages, page, limit }
      setItems(res.data ?? []);
      setTotal(res.total ?? 0);
      setPages(res.pages ?? 1);
    } catch (e) {
      console.error("Equipment list fetch error:", e);
      setError(e instanceof Error ? e.message : "Failed to load equipment");
    } finally {
      setLoading(false);
    }
  }, []); // no deps — pure function of args

  useEffect(() => {
    loadList(query);
  }, [queryKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateQuery = (patch: Partial<EquipmentListQuery>) => {
    setQuery(q => ({ ...q, ...patch, page: 1 }));
  };

  const refetch = () => loadList(query);

  return { items, total, pages, loading, error, query, updateQuery, refetch };
}

// ── Single spec hook ──────────────────────────────────────────────────────────

export function useEquipmentSpec(equipmentId: string | null) {
  const [spec,    setSpec]    = useState<EquipmentSpec | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const loadSpec = useCallback(async () => {
    if (!equipmentId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await equipmentAPI.get(equipmentId);
      setSpec(data);
    } catch (e) {
      console.error("Equipment spec fetch error:", e);
      setError(e instanceof Error ? e.message : "Failed to load spec");
    } finally {
      setLoading(false);
    }
  }, [equipmentId]);

  useEffect(() => {
    loadSpec();
  }, [loadSpec]);

  return { spec, loading, error, refetch: loadSpec, setSpec };
}

// ── OEMs hook ────────────────────────────────────────────────────────────────

export function useOEMs() {
  const [oems,    setOEMs]    = useState<OEM[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    equipmentAPI.oems.list()
      .then(r => setOEMs(r.oems ?? []))
      .catch((err) => console.error("OEM fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  return { oems, loading };
}

// ── Generic mutation helper ───────────────────────────────────────────────────
// Returns { ok: true, data } or { ok: false, error }
// so callers can always show the real backend error message.

export function useMutation<T, A extends unknown[]>(
  fn: (...args: A) => Promise<T>
) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const mutate = async (...args: A): Promise<T | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn(...args);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Operation failed";
      setError(msg);
      // Re-throw so callers can catch and show the real backend message
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error, clearError: () => setError(null) };
}