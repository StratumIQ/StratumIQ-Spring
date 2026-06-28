import { dashApi, toQueryString } from "@/lib/api/client";
import type { Pagination } from "@/types";

export type MarketingStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED" | "INACTIVE";

export type MarketingItem = {
  id:           number;
  type:         string;
  title:        string;
  subtitle?:    string | null;
  body?:        string | null;
  richContent?: string | null;
  imageUrl?:    string | null;
  thumbnailUrl?: string | null;
  ctaText?:     string | null;
  ctaUrl?:      string | null;
  isActive:     boolean;
  status:       MarketingStatus;
  isPinned:     boolean;
  priority:     number;
  tags?:        string | null;
  startsAt?:    string | null;
  endsAt?:      string | null;
  sortOrder:    number;
  createdBy?:   number | null;
  updatedBy?:   number | null;
  createdAt:    string;
  updatedAt:    string;
};

export type MarketingListResponse = {
  marketing:  MarketingItem[];
  pagination: Pagination;
};

export type MarketingKpiSummary = {
  totalNews: number;
  published: number;
  drafts: number;
  archived: number;
  pinned: number;
  scheduled: number;
  expired: number;
  totalViews: number;
  totalClicks: number;
  ctr: number;
};

export type MarketingFormData = {
  type:         string;
  title:        string;
  subtitle:     string;
  body:         string;
  richContent:  string;
  imageUrl:     string;
  thumbnailUrl: string;
  ctaText:      string;
  ctaUrl:       string;
  status:       MarketingStatus;
  isPinned:     boolean;
  priority:     number;
  tags:         string;
  startsAt:     string;
  endsAt:       string;
};

export type BulkMarketingAction = "PUBLISH" | "UNPUBLISH" | "ARCHIVE" | "DELETE";

export type MarketingListParams = {
  search?:          string;
  status?:          string;
  type?:            string;
  pinned?:          boolean;
  includeArchived?: boolean;
  sortBy?:          string;
  sortDir?:         string;
  page?:            number;
  limit?:           number;
};

export async function getMarketing(params: MarketingListParams = {}) {
  const qs = toQueryString(params as Record<string, unknown>);
  return dashApi<MarketingListResponse>(`/admin/marketing${qs}`);
}

export async function getMarketingById(id: number) {
  return dashApi<MarketingItem>(`/admin/marketing/${id}`);
}

export async function getMarketingKpis() {
  return dashApi<MarketingKpiSummary>("/admin/marketing/kpis");
}

export async function createMarketing(payload: Partial<MarketingFormData> & { type: string; title: string }) {
  return dashApi<MarketingItem>("/admin/marketing", { method: "POST", body: payload });
}

export async function updateMarketing(id: number, payload: Partial<MarketingFormData>) {
  return dashApi<MarketingItem>(`/admin/marketing/${id}`, { method: "PUT", body: payload });
}

export async function updateMarketingStatus(
  id: number,
  payload: { status?: MarketingStatus; isActive?: boolean; isPinned?: boolean },
) {
  return dashApi<MarketingItem>(`/admin/marketing/${id}/status`, { method: "PATCH", body: payload });
}

export async function archiveMarketing(id: number) {
  return dashApi<MarketingItem>(`/admin/marketing/${id}/archive`, { method: "POST" });
}

export async function restoreMarketing(id: number) {
  return dashApi<MarketingItem>(`/admin/marketing/${id}/restore`, { method: "POST" });
}

export async function duplicateMarketing(id: number) {
  return dashApi<MarketingItem>(`/admin/marketing/${id}/duplicate`, { method: "POST" });
}

export async function deleteMarketing(id: number) {
  return dashApi<void>(`/admin/marketing/${id}`, { method: "DELETE" });
}

export async function bulkMarketingAction(ids: number[], action: BulkMarketingAction) {
  return dashApi<{ affected: number; action: string }>("/admin/marketing/bulk", {
    method: "POST",
    body: { ids, action },
  });
}
