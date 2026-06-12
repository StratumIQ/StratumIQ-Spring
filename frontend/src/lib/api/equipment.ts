import { apiClient, dashApi, toQueryString } from "./client";
import type {
  OEM,
  Equipment,
  EquipmentSpec,
  EquipmentListResponse,
  EquipmentListQuery,
  TechnicalMaster,
  PerformanceRow,
  WearPart,
  MaintenanceTask,
  Commercial,
  Dealer,
  PricingRecord,
  Logistics,
  Certification,
  Environmental,
  Benchmark,
  Suitability,
  Ratings,
  Review,
  Media,
  MediaType,
} from "@/types/equipment";

const BASE = "/equipment";

export const equipmentApi = {
  oems: {
    list: () => apiClient<{ oems: OEM[] }>(`${BASE}/oems`),
    get: (id: number) => apiClient<{ oem: OEM }>(`${BASE}/oems/${id}`),
    create: (data: Partial<OEM>) =>
      dashApi<{ oem: OEM }>(`${BASE}/oems`, { method: "POST", body: data }),
    update: (id: number, data: Partial<OEM>) =>
      dashApi<{ oem: OEM }>(`${BASE}/oems/${id}`, { method: "PATCH", body: data }),
  },

  list: (q: EquipmentListQuery = {}) =>
    apiClient<EquipmentListResponse>(`${BASE}${toQueryString(q as Record<string, unknown>)}`),

  get: (id: string) => apiClient<EquipmentSpec>(`${BASE}/${id}`),

  create: (data: Partial<Equipment>) =>
    dashApi<{ equipment_id: string; equipment: Equipment }>(`${BASE}`, {
      method: "POST",
      body: data,
    }),

  update: (id: string, data: Partial<Equipment>) =>
    dashApi<{ equipment: Equipment }>(`${BASE}/${id}`, { method: "PATCH", body: data }),

  updateStatus: (id: string, status: string) =>
    dashApi<{ equipment: Equipment }>(`${BASE}/${id}/status`, {
      method: "PATCH",
      body: { status },
    }),

  technical: {
    upsertMaster: (id: string, data: Partial<TechnicalMaster>) =>
      dashApi<{ specs: TechnicalMaster }>(`${BASE}/${id}/specs/master`, {
        method: "POST",
        body: data,
      }),
    upsertTypeSpecs: (id: string, type: string, data: Record<string, unknown>) =>
      dashApi(`${BASE}/${id}/specs/type`, {
        method: "POST",
        body: { _equipment_type: type, ...data },
      }),
    upsertMobility: (id: string, data: Record<string, unknown>) =>
      dashApi(`${BASE}/${id}/specs/mobility`, { method: "POST", body: data }),
    listPerformance: (id: string) =>
      apiClient<{ rows: PerformanceRow[] }>(`${BASE}/${id}/specs/performance`),
    addPerformance: (id: string, data: Partial<PerformanceRow>) =>
      dashApi<{ row: PerformanceRow }>(`${BASE}/${id}/specs/performance`, {
        method: "POST",
        body: data,
      }),
    editPerformance: (id: string, rowId: number, data: Partial<PerformanceRow>) =>
      dashApi<{ row: PerformanceRow }>(`${BASE}/${id}/specs/performance/${rowId}`, {
        method: "PATCH",
        body: data,
      }),
    deletePerformance: (id: string, rowId: number) =>
      dashApi(`${BASE}/${id}/specs/performance/${rowId}`, { method: "DELETE" }),
    listWearParts: (id: string) =>
      apiClient<{ wear_parts: WearPart[] }>(`${BASE}/${id}/wear-parts`),
    addWearPart: (id: string, data: Partial<WearPart>) =>
      dashApi<{ part: WearPart }>(`${BASE}/${id}/wear-parts`, { method: "POST", body: data }),
    editWearPart: (id: string, partId: number, data: Partial<WearPart>) =>
      dashApi<{ part: WearPart }>(`${BASE}/${id}/wear-parts/${partId}`, {
        method: "PATCH",
        body: data,
      }),
    deleteWearPart: (id: string, partId: number) =>
      dashApi(`${BASE}/${id}/wear-parts/${partId}`, { method: "DELETE" }),
    listMaintenance: (id: string) =>
      apiClient<{ tasks: MaintenanceTask[] }>(`${BASE}/${id}/maintenance`),
    addMaintenance: (id: string, data: Partial<MaintenanceTask>) =>
      dashApi<{ task: MaintenanceTask }>(`${BASE}/${id}/maintenance`, {
        method: "POST",
        body: data,
      }),
    editMaintenance: (id: string, taskId: number, data: Partial<MaintenanceTask>) =>
      dashApi<{ task: MaintenanceTask }>(`${BASE}/${id}/maintenance/${taskId}`, {
        method: "PATCH",
        body: data,
      }),
    deleteMaintenance: (id: string, taskId: number) =>
      dashApi(`${BASE}/${id}/maintenance/${taskId}`, { method: "DELETE" }),
  },

  commercial: {
    get: (id: string) => dashApi<{ commercial: Commercial }>(`${BASE}/${id}/commercial`),
    upsert: (id: string, data: Partial<Commercial>) =>
      dashApi<{ commercial: Commercial }>(`${BASE}/${id}/commercial`, {
        method: "POST",
        body: data,
      }),
    listDealers: (id: string) => apiClient<{ dealers: Dealer[] }>(`${BASE}/${id}/dealers`),
    addDealer: (id: string, data: Partial<Dealer>) =>
      dashApi<{ dealer: Dealer }>(`${BASE}/${id}/dealers`, { method: "POST", body: data }),
    editDealer: (id: string, dealerId: number, data: Partial<Dealer>) =>
      dashApi<{ dealer: Dealer }>(`${BASE}/${id}/dealers/${dealerId}`, {
        method: "PATCH",
        body: data,
      }),
    deleteDealer: (id: string, dealerId: number) =>
      dashApi(`${BASE}/${id}/dealers/${dealerId}`, { method: "DELETE" }),
    listPricing: (id: string) =>
      apiClient<{ records: PricingRecord[] }>(`${BASE}/${id}/pricing`),
    addPricing: (id: string, data: Partial<PricingRecord>) =>
      dashApi<{ record: PricingRecord }>(`${BASE}/${id}/pricing`, { method: "POST", body: data }),
    editPricing: (id: string, priceId: number, data: Partial<PricingRecord>) =>
      dashApi<{ record: PricingRecord }>(`${BASE}/${id}/pricing/${priceId}`, {
        method: "PATCH",
        body: data,
      }),
    deletePricing: (id: string, priceId: number) =>
      dashApi(`${BASE}/${id}/pricing/${priceId}`, { method: "DELETE" }),
  },

  operational: {
    getLogistics: (id: string) => apiClient<{ logistics: Logistics }>(`${BASE}/${id}/logistics`),
    upsertLogistics: (id: string, data: Partial<Logistics>) =>
      dashApi<{ logistics: Logistics }>(`${BASE}/${id}/logistics`, {
        method: "POST",
        body: data,
      }),
    listCertifications: (id: string) =>
      apiClient<{ certs: Certification[] }>(`${BASE}/${id}/certifications`),
    addCertification: (id: string, data: Partial<Certification>) =>
      dashApi<{ cert: Certification }>(`${BASE}/${id}/certifications`, {
        method: "POST",
        body: data,
      }),
    editCertification: (id: string, certId: number, data: Partial<Certification>) =>
      dashApi<{ cert: Certification }>(`${BASE}/${id}/certifications/${certId}`, {
        method: "PATCH",
        body: data,
      }),
    deleteCertification: (id: string, certId: number) =>
      dashApi(`${BASE}/${id}/certifications/${certId}`, { method: "DELETE" }),
    getEnvironmental: (id: string) => apiClient<{ env: Environmental }>(`${BASE}/${id}/environmental`),
    upsertEnvironmental: (id: string, data: Partial<Environmental>) =>
      dashApi<{ env: Environmental }>(`${BASE}/${id}/environmental`, {
        method: "POST",
        body: data,
      }),
  },

  intelligence: {
    listBenchmarks: (id: string) =>
      apiClient<{ benchmarks: Benchmark[] }>(`${BASE}/${id}/benchmarks`),
    addBenchmark: (id: string, data: Partial<Benchmark>) =>
      dashApi<{ bench: Benchmark }>(`${BASE}/${id}/benchmarks`, { method: "POST", body: data }),
    editBenchmark: (id: string, benchId: number, data: Partial<Benchmark>) =>
      dashApi<{ bench: Benchmark }>(`${BASE}/${id}/benchmarks/${benchId}`, {
        method: "PATCH",
        body: data,
      }),
    deleteBenchmark: (id: string, benchId: number) =>
      dashApi(`${BASE}/${id}/benchmarks/${benchId}`, { method: "DELETE" }),
    getSuitability: (id: string) =>
      apiClient<{ suitability: Suitability }>(`${BASE}/${id}/suitability`),
    upsertSuitability: (id: string, data: Partial<Suitability>) =>
      dashApi<{ suitability: Suitability }>(`${BASE}/${id}/suitability`, {
        method: "POST",
        body: data,
      }),
    getRatings: (id: string) => apiClient<{ ratings: Ratings }>(`${BASE}/${id}/ratings`),
    upsertRatings: (id: string, data: Partial<Ratings>) =>
      dashApi<{ ratings: Ratings }>(`${BASE}/${id}/ratings`, { method: "POST", body: data }),
    listReviews: (id: string) => apiClient<{ reviews: Review[] }>(`${BASE}/${id}/reviews`),
    addReview: (id: string, data: Partial<Review>) =>
      dashApi<{ review: Review }>(`${BASE}/${id}/reviews`, { method: "POST", body: data }),
    editReview: (id: string, reviewId: number, data: Partial<Review>) =>
      dashApi<{ review: Review }>(`${BASE}/${id}/reviews/${reviewId}`, {
        method: "PATCH",
        body: data,
      }),
    deleteReview: (id: string, reviewId: number) =>
      dashApi(`${BASE}/${id}/reviews/${reviewId}`, { method: "DELETE" }),
  },

  media: {
    list: (id: string, type?: MediaType) =>
      apiClient<{ media: Media[] }>(`${BASE}/${id}/media${type ? `?type=${type}` : ""}`),
    upload: (id: string, data: Partial<Media>) =>
      dashApi<{ media: Media }>(`${BASE}/${id}/media`, { method: "POST", body: data }),
    edit: (id: string, mediaId: number, data: Partial<Media>) =>
      dashApi<{ media: Media }>(`${BASE}/${id}/media/${mediaId}`, {
        method: "PATCH",
        body: data,
      }),
    delete: (id: string, mediaId: number) =>
      dashApi(`${BASE}/${id}/media/${mediaId}`, { method: "DELETE" }),
  },
};

/** Backward-compatible alias used by existing equipment module */
export const equipmentAPI = equipmentApi;
