import { dashApi, toQueryString } from "@/lib/api/client";
import type { Pagination } from "@/types";
import type { MarketingItem } from "@/lib/api/marketing";

export type DashboardMarketingItem = MarketingItem;

export type DashboardMarketingListResponse = {
  marketing:  DashboardMarketingItem[];
  pagination: Pagination;
};

export async function getDashboardMarketing() {
  return dashApi<DashboardMarketingItem[]>("/dashboard/marketing");
}

export async function getAllDashboardMarketing(page = 1, limit = 12) {
  const qs = toQueryString({ page, limit });
  return dashApi<DashboardMarketingListResponse>(`/dashboard/marketing/all${qs}`);
}
