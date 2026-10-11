import { apiClient, dashApi, toQueryString } from "./client";

export type PartStatus = "DRAFT" | "ACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED" | "ARCHIVED";
export type PartType = "OEM" | "AFTERMARKET" | "GENUINE" | "REPLACEMENT";
export type PartCondition = "NEW" | "REFURBISHED" | "USED";
export type CurrencyType = "INR";

export type PartImage = {
  id?: number;
  imageUrl: string;
  displayOrder?: number;
  primary?: boolean;
};

export type PartAttribute = {
  id?: number;
  name: string;
  value: string;
  sortOrder?: number;
};

export type Part = {
  id: number;
  dealerId: number;
  dealerName?: string | null;
  partNumber: string;
  partName: string;
  shortDescription?: string | null;
  description?: string | null;
  categoryId: number;
  categoryName?: string | null;
  parentCategoryId?: number | null;
  parentCategoryName?: string | null;
  brandId?: number | null;
  brandName?: string | null;
  manufacturerId?: number | null;
  manufacturerName?: string | null;
  currency: CurrencyType;
  price: number;
  discountPrice?: number | null;
  quantity: number;
  unitOfMeasureId: number;
  unitName?: string | null;
  unitSymbol?: string | null;
  partType?: PartType | null;
  partCondition?: PartCondition | null;
  status: PartStatus;
  weight?: number | null;
  tags?: string | null;
  totalViews?: number;
  totalClicks?: number;
  totalLeads?: number;
  images?: PartImage[];
  imageUrls?: string[];
  documentUrls?: string[];
  attributes?: PartAttribute[];
  sku?: string | null;
  oemNumber?: string | null;
  warranty?: string | null;
  featured?: boolean;
  active?: boolean;
  inStock?: boolean;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  seoSlug?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type PartCategory = {
  id: number;
  name: string;
  description?: string | null;
  active: boolean;
  sortOrder: number;
  parentId?: number | null;
  parentName?: string | null;
};

export type NamedMaster = {
  id: number;
  name: string;
  description?: string | null;
  active: boolean;
  sortOrder: number;
  symbol?: string | null;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PartListResponse = {
  parts: Part[];
  pagination: Pagination;
};

export type PartWritePayload = {
  partNumber?: string;
  partName: string;
  shortDescription?: string;
  description?: string;
  categoryId: number;
  brandId?: number | null;
  manufacturerId?: number | null;
  dealerId?: number;
  currency: CurrencyType;
  price: number;
  discountPrice?: number | null;
  quantity?: number;
  unitOfMeasureId: number;
  partType?: PartType | null;
  partCondition?: PartCondition | null;
  status?: PartStatus;
  sku?: string;
  oemNumber?: string;
  warranty?: string;
  featured?: boolean;
  active?: boolean;
  weight?: number | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  tags?: string;
  images?: PartImage[];
  attributes?: PartAttribute[];
};

export type CatalogQuery = {
  keyword?: string;
  categoryId?: number | string;
  brandId?: number | string;
  manufacturerId?: number | string;
  minPrice?: number | string;
  maxPrice?: number | string;
  featured?: boolean;
  inStock?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
  status?: PartStatus;
  dealerId?: number | string;
};

export const partsApi = {
  catalog: {
    search: (q: CatalogQuery = {}) =>
      apiClient<PartListResponse>(`/parts${toQueryString(q as Record<string, unknown>)}`),
    get: (id: number | string) => apiClient<Part>(`/parts/${id}`),
    related: (id: number | string) => apiClient<Part[]>(`/parts/${id}/related`),
    inquire: (id: number | string, body: { message: string; quantity?: number }) =>
      dashApi(`/parts/${id}/inquiries`, { method: "POST", body }),
  },

  dealer: {
    list: (q: CatalogQuery = {}) =>
      dashApi<PartListResponse>(`/dealer/parts${toQueryString(q as Record<string, unknown>)}`),
    get: (id: number | string) => dashApi<Part>(`/dealer/parts/${id}`),
    create: (body: PartWritePayload) =>
      dashApi<Part>("/dealer/parts", { method: "POST", body }),
    update: (id: number | string, body: PartWritePayload) =>
      dashApi<Part>(`/dealer/parts/${id}`, { method: "PUT", body }),
    archive: (id: number | string) =>
      dashApi(`/dealer/parts/${id}`, { method: "DELETE" }),
  },

  admin: {
    list: (q: CatalogQuery = {}) =>
      dashApi<PartListResponse>(`/admin/parts${toQueryString(q as Record<string, unknown>)}`),
    get: (id: number | string) => dashApi<Part>(`/admin/parts/${id}`),
    create: (body: PartWritePayload) =>
      dashApi<Part>("/admin/parts", { method: "POST", body }),
    update: (id: number | string, body: PartWritePayload) =>
      dashApi<Part>(`/admin/parts/${id}`, { method: "PUT", body }),
    archive: (id: number | string) =>
      dashApi(`/admin/parts/${id}`, { method: "DELETE" }),
  },

  masters: {
    categories: (admin = false) =>
      apiClient<PartCategory[]>(admin ? "/admin/part-categories" : "/part-categories"),
    brands: (admin = false) =>
      apiClient<NamedMaster[]>(admin ? "/admin/part-brands" : "/part-brands"),
    manufacturers: (admin = false) =>
      apiClient<NamedMaster[]>(admin ? "/admin/manufacturers" : "/manufacturers"),
    units: (admin = false) =>
      apiClient<NamedMaster[]>(admin ? "/admin/unit-of-measure" : "/unit-of-measure"),
    createCategory: (body: Partial<PartCategory>) =>
      dashApi<PartCategory>("/admin/part-categories", { method: "POST", body }),
    updateCategory: (id: number, body: Partial<PartCategory>) =>
      dashApi<PartCategory>(`/admin/part-categories/${id}`, { method: "PUT", body }),
    archiveCategory: (id: number) =>
      dashApi(`/admin/part-categories/${id}`, { method: "DELETE" }),
    createBrand: (body: Partial<NamedMaster>) =>
      dashApi<NamedMaster>("/admin/part-brands", { method: "POST", body }),
    updateBrand: (id: number, body: Partial<NamedMaster>) =>
      dashApi<NamedMaster>(`/admin/part-brands/${id}`, { method: "PUT", body }),
    archiveBrand: (id: number) =>
      dashApi(`/admin/part-brands/${id}`, { method: "DELETE" }),
    createManufacturer: (body: Partial<NamedMaster>) =>
      dashApi<NamedMaster>("/admin/manufacturers", { method: "POST", body }),
    updateManufacturer: (id: number, body: Partial<NamedMaster>) =>
      dashApi<NamedMaster>(`/admin/manufacturers/${id}`, { method: "PUT", body }),
    archiveManufacturer: (id: number) =>
      dashApi(`/admin/manufacturers/${id}`, { method: "DELETE" }),
    createUnit: (body: Partial<NamedMaster>) =>
      dashApi<NamedMaster>("/admin/unit-of-measure", { method: "POST", body }),
    updateUnit: (id: number, body: Partial<NamedMaster>) =>
      dashApi<NamedMaster>(`/admin/unit-of-measure/${id}`, { method: "PUT", body }),
    archiveUnit: (id: number) =>
      dashApi(`/admin/unit-of-measure/${id}`, { method: "DELETE" }),
  },
};

export function formatInr(value?: number | null) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function sellingPrice(part: Pick<Part, "price" | "discountPrice">) {
  if (part.discountPrice != null && Number(part.discountPrice) > 0) {
    return Number(part.discountPrice);
  }
  return Number(part.price);
}

export function primaryImage(part: Part): string | null {
  const ordered = [...(part.images ?? [])].sort(
    (a, b) => Number(b.primary) - Number(a.primary) || (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
  );
  return ordered[0]?.imageUrl ?? part.imageUrls?.[0] ?? null;
}
