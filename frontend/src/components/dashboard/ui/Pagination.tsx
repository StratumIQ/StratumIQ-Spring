"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  total?: number;
};

export default function Pagination({ page, totalPages, onPageChange, total }: Props) {
  if (totalPages <= 1) return null;

  return (
    <nav className="d-pagination" aria-label="Pagination">
      {total !== undefined && (
        <span className="d-pagination-meta">{total.toLocaleString()} results</span>
      )}
      <div className="d-pagination-controls">
        <Button
          variant="outline"
          size="sm"
          icon={<ChevronLeft size={14} />}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          Prev
        </Button>
        <span className="d-pagination-page">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          Next
          <ChevronRight size={14} />
        </Button>
      </div>
    </nav>
  );
}
