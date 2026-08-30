"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Package, Plus } from "lucide-react";
import Link from "next/link";
import PageShell from "@/components/dashboard/layout/PageShell";
import FilterBar from "@/components/dashboard/common/FilterBar";
import Pagination from "@/components/dashboard/ui/Pagination";
import EmptyState from "@/components/dashboard/ui/EmptyState";
import Skeleton from "@/components/dashboard/ui/Skeleton";
import Button from "@/components/dashboard/ui/Button";
import PartCard from "@/components/dashboard/parts/PartCard";
import { useDashUser } from "@/components/dashboard/layout/DashboardContext";
import { partsApi, type PartCategory } from "@/lib/api/parts";

export default function PartsCatalogPage() {
  const user = useDashUser();
  const isDealer = user?.role === "DEALER";
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [inStock, setInStock] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const { data: categories = [] } = useQuery({
    queryKey: ["part-categories"],
    queryFn: () => partsApi.masters.categories(),
  });
  const { data: brands = [] } = useQuery({
    queryKey: ["part-brands"],
    queryFn: () => partsApi.masters.brands(),
  });

  const query = {
    keyword: keyword || undefined,
    categoryId: categoryId || undefined,
    brandId: brandId || undefined,
    inStock: inStock === "true" ? true : undefined,
    sort,
    page,
    limit: 12,
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["parts-catalog", query],
    queryFn: () => partsApi.catalog.search(query),
  });

  const categoryOptions = useMemo(() => {
    const cats = categories as PartCategory[];
    return [
      { value: "", label: "All categories" },
      ...cats.map((c) => ({
        value: String(c.id),
        label: c.parentName ? `${c.parentName} / ${c.name}` : c.name,
      })),
    ];
  }, [categories]);

  return (
    <PageShell
      title="Parts"
      description="OEM and aftermarket parts for crushing and screening equipment."
      breadcrumbs={[{ label: "Parts" }]}
      actions={isDealer ? (
        <Link href="/dashboard/parts/manage">
          <Button icon={<Plus size={16} />}>My listings</Button>
        </Link>
      ) : undefined}
    >
      <FilterBar
        search={keyword}
        onSearchChange={(v) => { setKeyword(v); setPage(1); }}
        searchPlaceholder="Search name, part number, SKU, brand…"
        selects={[
          { key: "category", value: categoryId, onChange: (v) => { setCategoryId(v); setPage(1); }, options: categoryOptions, width: 200 },
          {
            key: "brand",
            value: brandId,
            onChange: (v) => { setBrandId(v); setPage(1); },
            options: [{ value: "", label: "All brands" }, ...brands.map((b) => ({ value: String(b.id), label: b.name }))],
            width: 160,
          },
          {
            key: "stock",
            value: inStock,
            onChange: (v) => { setInStock(v); setPage(1); },
            options: [
              { value: "", label: "Any availability" },
              { value: "true", label: "In stock" },
            ],
            width: 160,
          },
          {
            key: "sort",
            value: sort,
            onChange: setSort,
            options: [
              { value: "newest", label: "Newest" },
              { value: "price_asc", label: "Price: low to high" },
              { value: "price_desc", label: "Price: high to low" },
              { value: "name", label: "Name" },
            ],
            width: 180,
          },
        ]}
      />

      {isLoading && (
        <div className="d-part-grid" style={{ marginTop: 16 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} height={280} />
          ))}
        </div>
      )}

      {isError && (
        <EmptyState
          icon={Package}
          title="Unable to load parts"
          description="Check your connection and try again."
          action={{ label: "Retry", onClick: () => void refetch() }}
        />
      )}

      {!isLoading && !isError && (data?.parts.length ?? 0) === 0 && (
        <EmptyState
          icon={Package}
          title="No parts found"
          description="Try a different search or category. Dealers can add listings from My listings."
        />
      )}

      {!isLoading && !isError && (data?.parts.length ?? 0) > 0 && (
        <>
          <div className="d-part-grid" style={{ marginTop: 16 }}>
            {data!.parts.map((part) => <PartCard key={part.id} part={part} />)}
          </div>
          <Pagination
            page={data!.pagination.page}
            totalPages={data!.pagination.totalPages}
            total={data!.pagination.total}
            onPageChange={setPage}
          />
        </>
      )}
    </PageShell>
  );
}
