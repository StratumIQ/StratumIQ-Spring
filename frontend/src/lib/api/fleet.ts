import { dashApi, toQueryString } from "./client";
import { keysToCamel, keysToSnake } from "./transform";
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

function mapEquipment(raw: unknown): FleetEquipment {
  return keysToSnake<FleetEquipment>(raw);
}

function mapList(raw: unknown): FleetListResponse {
  const data = raw as { equipment: unknown[]; pagination: FleetListResponse["pagination"] };
  return {
    equipment: (data.equipment ?? []).map(mapEquipment),
    pagination: data.pagination,
  };
}

function mapSummary(raw: unknown): FleetSummary {
  return keysToSnake<FleetSummary>(raw);
}

function mapRecord(raw: unknown): ServiceRecord {
  return keysToSnake<ServiceRecord>(raw);
}

function mapOperation(raw: unknown): OperationLog {
  return keysToSnake<OperationLog>(raw);
}

function toCreateBody(payload: CreateEquipmentPayload) {
  return keysToCamel(payload);
}

function toUpdateBody(payload: UpdateEquipmentPayload) {
  return keysToCamel(payload);
}

function toServiceBody(payload: CreateServiceRecordPayload | UpdateServiceRecordPayload) {
  const body = keysToCamel(payload) as Record<string, unknown>;
  if (body.serviceType && typeof body.serviceType === "string") {
    body.serviceType = (body.serviceType as string).toUpperCase();
  }
  if (body.status && typeof body.status === "string") {
    body.status = (body.status as string).toUpperCase();
  }
  return body;
}

function toOperationBody(payload: LogOperationPayload) {
  const body = keysToCamel(payload) as Record<string, unknown>;
  if (body.eventType && typeof body.eventType === "string") {
    body.eventType = (body.eventType as string).toLowerCase();
  }
  return body;
}

export const fleetApi = {
  register: async (payload: CreateEquipmentPayload) => {
    const res = await dashApi<{ message: string; equipment: unknown }>("/fleet", {
      method: "POST",
      body: toCreateBody(payload),
    });
    return { message: res.message, equipment: mapEquipment(res.equipment) };
  },

  list: async (params: ListEquipmentParams = {}) => {
    const res = await dashApi<unknown>(`/fleet${toQueryString(params as Record<string, unknown>)}`);
    return mapList(res);
  },

  summary: async () => {
    const res = await dashApi<{ summary: unknown }>("/fleet/summary");
    return { summary: mapSummary(res.summary) };
  },

  get: async (id: number) => {
    const res = await dashApi<{ equipment: unknown }>(`/fleet/${id}`);
    return { equipment: mapEquipment(res.equipment) };
  },

  update: async (id: number, payload: UpdateEquipmentPayload) => {
    const res = await dashApi<{ message: string; equipment: unknown }>(`/fleet/${id}`, {
      method: "PUT",
      body: toUpdateBody(payload),
    });
    return { message: res.message, equipment: mapEquipment(res.equipment) };
  },

  updateStatus: async (id: number, payload: UpdateStatusPayload) => {
    const res = await dashApi<{ message: string; equipment: unknown }>(`/fleet/${id}/status`, {
      method: "PATCH",
      body: { status: payload.status },
    });
    return { message: res.message, equipment: mapEquipment(res.equipment) };
  },

  updateHours: async (id: number, payload: UpdateHoursPayload) => {
    const current = await fleetApi.get(id);
    const currentHours = parseFloat(current.equipment.running_hours) || 0;
    const newTotal = payload.running_hours;
    const delta = newTotal - currentHours;

    if (delta < 0) {
      throw new Error(`New hours (${newTotal}) cannot be less than current (${currentHours})`);
    }

    const res = await dashApi<{ message: string; operation: unknown }>(`/fleet/${id}/hours`, {
      method: "PATCH",
      body: {
        eventType: "hours_update",
        hoursLogged: delta,
        note: payload.note,
      },
    });
    return { message: res.message, operation: mapOperation(res.operation) };
  },

  delete: (id: number) =>
    dashApi<{ message: string }>(`/fleet/${id}`, { method: "DELETE" }),

  createServiceRecord: async (equipmentId: number, payload: CreateServiceRecordPayload) => {
    const res = await dashApi<{ message: string; record: unknown }>(
      `/fleet/${equipmentId}/service-records`,
      { method: "POST", body: toServiceBody(payload) },
    );
    return { message: res.message, record: mapRecord(res.record) };
  },

  listServiceRecords: async (equipmentId: number) => {
    const res = await dashApi<{ records: unknown[] }>(`/fleet/${equipmentId}/service-records`);
    return { records: (res.records ?? []).map(mapRecord) };
  },

  updateServiceRecord: async (
    equipmentId: number,
    recordId: number,
    payload: UpdateServiceRecordPayload,
  ) => {
    const res = await dashApi<{ message: string; record: unknown }>(
      `/fleet/${equipmentId}/service-records/${recordId}`,
      { method: "PUT", body: toServiceBody(payload) },
    );
    return { message: res.message, record: mapRecord(res.record) };
  },

  deleteServiceRecord: (equipmentId: number, recordId: number) =>
    dashApi<{ message: string }>(
      `/fleet/${equipmentId}/service-records/${recordId}`,
      { method: "DELETE" },
    ),

  logOperation: async (equipmentId: number, payload: LogOperationPayload) => {
    const res = await dashApi<{ message: string; operation: unknown }>(
      `/fleet/${equipmentId}/operations`,
      { method: "POST", body: toOperationBody(payload) },
    );
    return { message: res.message, operation: mapOperation(res.operation) };
  },

  listOperations: async (equipmentId: number) => {
    const res = await dashApi<{ operations: unknown[] }>(`/fleet/${equipmentId}/operations`);
    return { operations: (res.operations ?? []).map(mapOperation) };
  },
};
