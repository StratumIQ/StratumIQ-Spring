"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import Badge from "@/components/dashboard/ui/Badge";
import { resolveAssetUrl } from "@/lib/constants";
import { formatInr, primaryImage, sellingPrice, type Part } from "@/lib/api/parts";

export default function PartCard({ part }: { part: Part }) {
  const img = primaryImage(part);
  const sell = sellingPrice(part);
  const hasDiscount = part.discountPrice != null && Number(part.discountPrice) > 0 && Number(part.discountPrice) < Number(part.price);

  return (
    <Link href={`/dashboard/parts/${part.id}`} className="d-part-card">
      <div className="d-part-card-media">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={resolveAssetUrl(img) ?? img} alt={part.partName} />
        ) : (
          <div className="d-part-card-placeholder">
            <Package size={28} />
          </div>
        )}
        {hasDiscount && <span className="d-part-card-badge">Offer</span>}
      </div>
      <div className="d-part-card-body">
        <div className="d-part-card-meta">
          {part.brandName || part.categoryName || "Aftermarket"}
        </div>
        <h3 className="d-part-card-title">{part.partName}</h3>
        <div className="d-part-card-sku">{part.partNumber}</div>
        <div className="d-part-card-price-row">
          <span className="d-part-card-price">{formatInr(sell)}</span>
          {hasDiscount && <span className="d-part-card-mrp">{formatInr(part.price)}</span>}
        </div>
        <div className="d-part-card-footer">
          <Badge variant={part.inStock ? "success" : "warning"} size="sm">
            {part.inStock ? "In stock" : "Check availability"}
          </Badge>
          {part.dealerName && <span className="d-part-card-seller">{part.dealerName}</span>}
        </div>
      </div>
    </Link>
  );
}
