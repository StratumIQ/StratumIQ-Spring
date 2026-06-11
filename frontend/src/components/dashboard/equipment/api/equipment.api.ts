import { apiFetch, dashFetch } from "@/lib/utils";
import type {
  OEM, Equipment, EquipmentSpec, EquipmentListResponse, EquipmentListQuery,
  TechnicalMaster, PerformanceRow, WearPart, MaintenanceTask,
  Commercial, Dealer, PricingRecord,
  Logistics, Certification, Environmental,
  Benchmark, Suitability, Ratings, Review,
  Media, MediaType,
} from "@/types/equipment";

const BASE = "/equipment";

// ── helpers ───────────────────────────────────────────────────────────────────

const qs = (params: Record<string, unknown>) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
  });
  const str = q.toString();
  return str ? `?${str}` : "";
};

// ════════════════════════════════════════════════════════════════════════════
// A. IDENTITY LAYER
// ════════════════════════════════════════════════════════════════════════════

export const equipmentAPI = {
  // OEMs
  oems: {
    list: ()                       => apiFetch<{ oems: OEM[] }>(`${BASE}/oems`),
    get:  (id: number)             => apiFetch<{ oem: OEM }>(`${BASE}/oems/${id}`),
    create: (data: Partial<OEM>)   => dashFetch<{ oem: OEM }>(`${BASE}/oems`, { method: "POST", body: data }),
    update: (id: number, data: Partial<OEM>) =>
      dashFetch<{ oem: OEM }>(`${BASE}/oems/${id}`, { method: "PATCH", body: data }),
  },

  // Equipment identity
  list:   (q: EquipmentListQuery = {}) =>
    apiFetch<EquipmentListResponse>(`${BASE}${qs(q as Record<string, unknown>)}`),
  get:    (id: string)                 =>
    apiFetch<EquipmentSpec>(`${BASE}/${id}`),
  create: (data: Partial<Equipment>)   =>
    dashFetch<{ equipment_id: string; equipment: Equipment }>(`${BASE}`, { method: "POST", body: data }),
  update: (id: string, data: Partial<Equipment>) =>
    dashFetch<{ equipment: Equipment }>(`${BASE}/${id}`, { method: "PATCH", body: data }),
  updateStatus: (id: string, status: string) =>
    dashFetch<{ equipment: Equipment }>(`${BASE}/${id}/status`, { method: "PATCH", body: { status } }),

  // ── B. TECHNICAL ────────────────────────────────────────────────────────────

  technical: {
    upsertMaster: (id: string, data: Partial<TechnicalMaster>) =>
      dashFetch<{ specs: TechnicalMaster }>(`${BASE}/${id}/specs/master`, { method: "POST", body: data }),

    upsertTypeSpecs: (id: string, type: string, data: Record<string, unknown>) =>
      dashFetch(`${BASE}/${id}/specs/type`, { method: "POST", body: { _equipment_type: type, ...data } }),

    upsertMobility: (id: string, data: Record<string, unknown>) =>
      dashFetch(`${BASE}/${id}/specs/mobility`, { method: "POST", body: data }),

    listPerformance: (id: string) =>
      apiFetch<{ rows: PerformanceRow[] }>(`${BASE}/${id}/specs/performance`),
    addPerformance: (id: string, data: Partial<PerformanceRow>) =>
      dashFetch<{ row: PerformanceRow }>(`${BASE}/${id}/specs/performance`, { method: "POST", body: data }),
    editPerformance: (id: string, rowId: number, data: Partial<PerformanceRow>) =>
      dashFetch<{ row: PerformanceRow }>(`${BASE}/${id}/specs/performance/${rowId}`, { method: "PATCH", body: data }),
    deletePerformance: (id: string, rowId: number) =>
      dashFetch(`${BASE}/${id}/specs/performance/${rowId}`, { method: "DELETE" }),

    listWearParts: (id: string) =>
      apiFetch<{ wear_parts: WearPart[] }>(`${BASE}/${id}/wear-parts`),
    addWearPart: (id: string, data: Partial<WearPart>) =>
      dashFetch<{ part: WearPart }>(`${BASE}/${id}/wear-parts`, { method: "POST", body: data }),
    editWearPart: (id: string, partId: number, data: Partial<WearPart>) =>
      dashFetch<{ part: WearPart }>(`${BASE}/${id}/wear-parts/${partId}`, { method: "PATCH", body: data }),
    deleteWearPart: (id: string, partId: number) =>
      dashFetch(`${BASE}/${id}/wear-parts/${partId}`, { method: "DELETE" }),

    listMaintenance: (id: string) =>
      apiFetch<{ tasks: MaintenanceTask[] }>(`${BASE}/${id}/maintenance`),
    addMaintenance: (id: string, data: Partial<MaintenanceTask>) =>
      dashFetch<{ task: MaintenanceTask }>(`${BASE}/${id}/maintenance`, { method: "POST", body: data }),
    editMaintenance: (id: string, taskId: number, data: Partial<MaintenanceTask>) =>
      dashFetch<{ task: MaintenanceTask }>(`${BASE}/${id}/maintenance/${taskId}`, { method: "PATCH", body: data }),
    deleteMaintenance: (id: string, taskId: number) =>
      dashFetch(`${BASE}/${id}/maintenance/${taskId}`, { method: "DELETE" }),
  },

  // ── C. COMMERCIAL ───────────────────────────────────────────────────────────

  commercial: {
    get:    (id: string)                       => dashFetch<{ commercial: Commercial }>(`${BASE}/${id}/commercial`),
    upsert: (id: string, data: Partial<Commercial>) =>
      dashFetch<{ commercial: Commercial }>(`${BASE}/${id}/commercial`, { method: "POST", body: data }),

    listDealers: (id: string) =>
      apiFetch<{ dealers: Dealer[] }>(`${BASE}/${id}/dealers`),
    addDealer: (id: string, data: Partial<Dealer>) =>
      dashFetch<{ dealer: Dealer }>(`${BASE}/${id}/dealers`, { method: "POST", body: data }),
    editDealer: (id: string, dealerId: number, data: Partial<Dealer>) =>
      dashFetch<{ dealer: Dealer }>(`${BASE}/${id}/dealers/${dealerId}`, { method: "PATCH", body: data }),
    deleteDealer: (id: string, dealerId: number) =>
      dashFetch(`${BASE}/${id}/dealers/${dealerId}`, { method: "DELETE" }),

    listPricing: (id: string) =>
      apiFetch<{ records: PricingRecord[] }>(`${BASE}/${id}/pricing`),
    addPricing: (id: string, data: Partial<PricingRecord>) =>
      dashFetch<{ record: PricingRecord }>(`${BASE}/${id}/pricing`, { method: "POST", body: data }),
    editPricing: (id: string, priceId: number, data: Partial<PricingRecord>) =>
      dashFetch<{ record: PricingRecord }>(`${BASE}/${id}/pricing/${priceId}`, { method: "PATCH", body: data }),
    deletePricing: (id: string, priceId: number) =>
      dashFetch(`${BASE}/${id}/pricing/${priceId}`, { method: "DELETE" }),
  },

  // ── D. OPERATIONAL ──────────────────────────────────────────────────────────

  operational: {
    getLogistics:    (id: string) => apiFetch<{ logistics: Logistics }>(`${BASE}/${id}/logistics`),
    upsertLogistics: (id: string, data: Partial<Logistics>) =>
      dashFetch<{ logistics: Logistics }>(`${BASE}/${id}/logistics`, { method: "POST", body: data }),

    listCertifications: (id: string) =>
      apiFetch<{ certs: Certification[] }>(`${BASE}/${id}/certifications`),
    addCertification: (id: string, data: Partial<Certification>) =>
      dashFetch<{ cert: Certification }>(`${BASE}/${id}/certifications`, { method: "POST", body: data }),
    editCertification: (id: string, certId: number, data: Partial<Certification>) =>
      dashFetch<{ cert: Certification }>(`${BASE}/${id}/certifications/${certId}`, { method: "PATCH", body: data }),
    deleteCertification: (id: string, certId: number) =>
      dashFetch(`${BASE}/${id}/certifications/${certId}`, { method: "DELETE" }),

    getEnvironmental:    (id: string) => apiFetch<{ env: Environmental }>(`${BASE}/${id}/environmental`),
    upsertEnvironmental: (id: string, data: Partial<Environmental>) =>
      dashFetch<{ env: Environmental }>(`${BASE}/${id}/environmental`, { method: "POST", body: data }),
  },

  // ── E. INTELLIGENCE ─────────────────────────────────────────────────────────

  intelligence: {
    listBenchmarks: (id: string) =>
      apiFetch<{ benchmarks: Benchmark[] }>(`${BASE}/${id}/benchmarks`),
    addBenchmark: (id: string, data: Partial<Benchmark>) =>
      dashFetch<{ bench: Benchmark }>(`${BASE}/${id}/benchmarks`, { method: "POST", body: data }),
    editBenchmark: (id: string, benchId: number, data: Partial<Benchmark>) =>
      dashFetch<{ bench: Benchmark }>(`${BASE}/${id}/benchmarks/${benchId}`, { method: "PATCH", body: data }),
    deleteBenchmark: (id: string, benchId: number) =>
      dashFetch(`${BASE}/${id}/benchmarks/${benchId}`, { method: "DELETE" }),

    getSuitability:    (id: string) => apiFetch<{ suitability: Suitability }>(`${BASE}/${id}/suitability`),
    upsertSuitability: (id: string, data: Partial<Suitability>) =>
      dashFetch<{ suitability: Suitability }>(`${BASE}/${id}/suitability`, { method: "POST", body: data }),

    getRatings:    (id: string) => apiFetch<{ ratings: Ratings }>(`${BASE}/${id}/ratings`),
    upsertRatings: (id: string, data: Partial<Ratings>) =>
      dashFetch<{ ratings: Ratings }>(`${BASE}/${id}/ratings`, { method: "POST", body: data }),

    listReviews: (id: string) =>
      apiFetch<{ reviews: Review[] }>(`${BASE}/${id}/reviews`),
    addReview: (id: string, data: Partial<Review>) =>
      dashFetch<{ review: Review }>(`${BASE}/${id}/reviews`, { method: "POST", body: data }),
    editReview: (id: string, reviewId: number, data: Partial<Review>) =>
      dashFetch<{ review: Review }>(`${BASE}/${id}/reviews/${reviewId}`, { method: "PATCH", body: data }),
    deleteReview: (id: string, reviewId: number) =>
      dashFetch(`${BASE}/${id}/reviews/${reviewId}`, { method: "DELETE" }),
  },

  // ── F. MEDIA ────────────────────────────────────────────────────────────────

  media: {
    list:   (id: string, type?: MediaType) =>
      apiFetch<{ media: Media[] }>(`${BASE}/${id}/media${type ? `?type=${type}` : ""}`),
    upload: (id: string, data: Partial<Media>) =>
      dashFetch<{ media: Media }>(`${BASE}/${id}/media`, { method: "POST", body: data }),
    edit:   (id: string, mediaId: number, data: Partial<Media>) =>
      dashFetch<{ media: Media }>(`${BASE}/${id}/media/${mediaId}`, { method: "PATCH", body: data }),
    delete: (id: string, mediaId: number) =>
      dashFetch(`${BASE}/${id}/media/${mediaId}`, { method: "DELETE" }),
  },
};

