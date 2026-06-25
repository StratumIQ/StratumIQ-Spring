import { dashApi } from "@/lib/api/client";

export interface MarketingItem {
  id: number;
  type: string;
  title: string;
  body?: string;
  imageUrl?: string;
  ctaUrl?: string;
  isActive: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MarketingListResponse {
  total: number;
  marketing: MarketingItem[];
}

export async function getMarketing() {
  return dashApi<MarketingListResponse>(
    "/admin/marketing"
  );

  
}

export interface CreateMarketingRequest {
  type: string;
  title: string;
  body: string;
  imageUrl?: string;
  ctaUrl?: string;
  isActive: boolean;
  sortOrder: number;
}

export async function createMarketing(
  payload: CreateMarketingRequest
) {
  return dashApi("/admin/marketing", {
    method: "POST",
    body: payload,
  });
}

export interface UpdateMarketingRequest {
  title: string;
  body: string;
}

export async function updateMarketing(
  id: number,
  payload: UpdateMarketingRequest
) {
  return dashApi(`/admin/marketing/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function updateMarketingStatus(
  id: number,
  isActive: boolean
) {
  return dashApi(`/admin/marketing/${id}/status`, {
    method: "PATCH",
    body: {
      isActive,
    },
  });
}

export async function deleteMarketing(
  id: number
) {
  return dashApi(`/admin/marketing/${id}`, {
    method: "DELETE",
  });
}