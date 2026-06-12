import { dashApi, toQueryString } from "./client";
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

export const fleetApi = {
  register: (payload: CreateEquipmentPayload) =>
    dashApi<{ message: string; equipment: FleetEquipment }>("/fleet", {
      method: "POST",
      body: payload,
    }),

  list: (params: ListEquipmentParams = {}) =>
    dashApi<FleetListResponse>(`/fleet${toQueryString(params as Record<string, unknown>)}`),

  summary: () => dashApi<{ summary: FleetSummary }>("/fleet/summary"),

  get: (id: number) => dashApi<{ equipment: FleetEquipment }>(`/fleet/${id}`),

  update: (id: number, payload: UpdateEquipmentPayload) =>
    dashApi<{ message: string; equipment: FleetEquipment }>(`/fleet/${id}`, {
      method: "PUT",
      body: payload,
    }),

  updateStatus: (id: number, payload: UpdateStatusPayload) =>
    dashApi<{ message: string; equipment: FleetEquipment }>(`/fleet/${id}/status`, {
      method: "PATCH",
      body: payload,
    }),

  updateHours: (id: number, payload: UpdateHoursPayload) =>
    dashApi<{ message: string; operation: OperationLog }>(`/fleet/${id}/hours`, {
      method: "PATCH",
      body: payload,
    }),

  delete: (id: number) =>
    dashApi<{ message: string }>(`/fleet/${id}`, { method: "DELETE" }),

  createServiceRecord: (equipmentId: number, payload: CreateServiceRecordPayload) =>
    dashApi<{ message: string; record: ServiceRecord }>(
      `/fleet/${equipmentId}/service-records`,
      { method: "POST", body: payload },
    ),

  listServiceRecords: (equipmentId: number) =>
    dashApi<{ records: ServiceRecord[] }>(`/fleet/${equipmentId}/service-records`),

  updateServiceRecord: (
    equipmentId: number,
    recordId: number,
    payload: UpdateServiceRecordPayload,
  ) =>
    dashApi<{ message: string; record: ServiceRecord }>(
      `/fleet/${equipmentId}/service-records/${recordId}`,
      { method: "PUT", body: payload },
    ),

  deleteServiceRecord: (equipmentId: number, recordId: number) =>
    dashApi<{ message: string }>(
      `/fleet/${equipmentId}/service-records/${recordId}`,
      { method: "DELETE" },
    ),

  logOperation: (equipmentId: number, payload: LogOperationPayload) =>
    dashApi<{ message: string; operation: OperationLog }>(
      `/fleet/${equipmentId}/operations`,
      { method: "POST", body: payload },
    ),

  listOperations: (equipmentId: number) =>
    dashApi<{ operations: OperationLog[] }>(`/fleet/${equipmentId}/operations`),
};
