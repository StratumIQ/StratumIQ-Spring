/**
 * Fleet API Client — StratumIQ
 * Path: frontend/src/components/dashboard/fleet/api/fleet.api.ts
 *
 * All calls go through dashFetch (injects Bearer token, reads from localStorage).
 * Endpoints match fleet.routes.js exactly — never hardcode URLs elsewhere.
 *
 * Sections:
 *   A. Equipment
 *   B. Service Records
 *   C. Operations Log
 */

import { dashFetch } from "@/lib/utils";
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

// ── Helper: build query string from params object ─────────────
function toQueryString(params: Record<string, unknown>): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== "" && v !== null
  );
  if (!entries.length) return "";
  return "?" + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

// ══════════════════════════════════════════════════════════════
// A. EQUIPMENT
// ══════════════════════════════════════════════════════════════

/**
 * POST /api/fleet
 * Register a new asset.
 */
export const registerEquipment = (payload: CreateEquipmentPayload) =>
  dashFetch<{ message: string; equipment: FleetEquipment }>("/fleet", {
    method: "POST",
    body:   payload,
  });

/**
 * GET /api/fleet
 * Paginated + filtered list.
 */
export const listEquipment = (params: ListEquipmentParams = {}) =>
  dashFetch<FleetListResponse>(`/fleet${toQueryString(params as Record<string, unknown>)}`);

/**
 * GET /api/fleet/summary
 * Fleet overview widget data.
 */
export const getFleetSummary = () =>
  dashFetch<{ summary: FleetSummary }>("/fleet/summary");

/**
 * GET /api/fleet/:id
 * Single asset detail — includes service_count and overdue_count.
 */
export const getEquipment = (id: number) =>
  dashFetch<{ equipment: FleetEquipment }>(`/fleet/${id}`);

/**
 * PUT /api/fleet/:id
 * Partial or full field update.
 */
export const updateEquipment = (id: number, payload: UpdateEquipmentPayload) =>
  dashFetch<{ message: string; equipment: FleetEquipment }>(`/fleet/${id}`, {
    method: "PUT",
    body:   payload,
  });

/**
 * PATCH /api/fleet/:id/status
 * Inline status toggle.
 */
export const updateEquipmentStatus = (id: number, payload: UpdateStatusPayload) =>
  dashFetch<{ message: string; equipment: FleetEquipment }>(`/fleet/${id}/status`, {
    method: "PATCH",
    body:   payload,
  });

/**
 * PATCH /api/fleet/:id/hours
 * Update running hours (absolute new total).
 */
export const updateEquipmentHours = (id: number, payload: UpdateHoursPayload) =>
  dashFetch<{ message: string; operation: OperationLog }>(`/fleet/${id}/hours`, {
    method: "PATCH",
    body:   payload,
  });

/**
 * DELETE /api/fleet/:id
 * Hard delete — cascades to service records and operations.
 */
export const deleteEquipment = (id: number) =>
  dashFetch<{ message: string }>(`/fleet/${id}`, { method: "DELETE" });

// ══════════════════════════════════════════════════════════════
// B. SERVICE RECORDS
// ══════════════════════════════════════════════════════════════

/**
 * POST /api/fleet/:id/service-records
 */
export const createServiceRecord = (equipmentId: number, payload: CreateServiceRecordPayload) =>
  dashFetch<{ message: string; record: ServiceRecord }>(`/fleet/${equipmentId}/service-records`, {
    method: "POST",
    body:   payload,
  });

/**
 * GET /api/fleet/:id/service-records
 */
export const listServiceRecords = (equipmentId: number) =>
  dashFetch<{ records: ServiceRecord[] }>(`/fleet/${equipmentId}/service-records`);

/**
 * PUT /api/fleet/:id/service-records/:recordId
 */
export const updateServiceRecord = (
  equipmentId: number,
  recordId:    number,
  payload:     UpdateServiceRecordPayload
) =>
  dashFetch<{ message: string; record: ServiceRecord }>(
    `/fleet/${equipmentId}/service-records/${recordId}`,
    { method: "PUT", body: payload }
  );

/**
 * DELETE /api/fleet/:id/service-records/:recordId
 */
export const deleteServiceRecord = (equipmentId: number, recordId: number) =>
  dashFetch<{ message: string }>(
    `/fleet/${equipmentId}/service-records/${recordId}`,
    { method: "DELETE" }
  );

// ══════════════════════════════════════════════════════════════
// C. OPERATIONS LOG
// ══════════════════════════════════════════════════════════════

/**
 * POST /api/fleet/:id/operations
 */
export const logOperation = (equipmentId: number, payload: LogOperationPayload) =>
  dashFetch<{ message: string; operation: OperationLog }>(`/fleet/${equipmentId}/operations`, {
    method: "POST",
    body:   payload,
  });

/**
 * GET /api/fleet/:id/operations
 */
export const listOperations = (equipmentId: number) =>
  dashFetch<{ operations: OperationLog[] }>(`/fleet/${equipmentId}/operations`);