"use client";

import { useMemo, useState } from "react";
import { Package } from "lucide-react";
import { resolveAssetUrl } from "@/lib/constants";
import type { Part } from "@/lib/api/parts";

export default function PartGallery({ part }: { part: Part }) {
  const images = useMemo(() => {
    const list = [...(part.images ?? [])].sort(
      (a, b) => Number(b.primary) - Number(a.primary) || (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
    );
    if (list.length) return list.map((i) => i.imageUrl);
    return part.imageUrls ?? [];
  }, [part]);
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div className="d-part-gallery">
      <div className="d-part-gallery-main">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={resolveAssetUrl(current) ?? current} alt={part.partName} />
        ) : (
          <div className="d-part-gallery-empty">
            <Package size={40} />
            <span>No image available</span>
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="d-part-gallery-thumbs">
          {images.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              className={`d-part-gallery-thumb${i === active ? " is-active" : ""}`}
              onClick={() => setActive(i)}
              aria-label={`Image ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolveAssetUrl(url) ?? url} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
