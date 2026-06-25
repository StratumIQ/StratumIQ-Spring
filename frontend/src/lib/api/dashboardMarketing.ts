import { dashApi } from "@/lib/api/client";

export interface DashboardMarketingItem {
  id: number;
  type: string;
  title: string;
  body: string;
  imageUrl: string | null;
  ctaUrl: string | null;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export async function getDashboardMarketing() {
  return dashApi<DashboardMarketingItem[]>(
    "/dashboard/marketing"
  );
}