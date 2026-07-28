"use client";

import Link from "next/link";
import { useCallback } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  pageSizeOptions?: number[];
  baseUrl: string;
  extraParams?: Record<string, string>;
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50];

function buildUrl(baseUrl: string, params: Record<string, string>): string {
  const search = new URLSearchParams(params).toString();
  return search ? `${baseUrl}?${search}` : baseUrl;
}

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [];

  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, "ellipsis", total);
  } else if (current >= total - 3) {
    pages.push(1, "ellipsis", total - 4, total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, "ellipsis", current - 1, current, current + 1, "ellipsis", total);
  }

  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  total,
  pageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  baseUrl,
  extraParams = {},
}: PaginationProps) {
  const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);

  const baseParams = { ...extraParams };

  const pageLink = useCallback(
    (page: number) => {
      if (page < 1 || page > totalPages) return "#";
      return buildUrl(baseUrl, { ...baseParams, page: String(page), limit: String(pageSize) });
    },
    [baseUrl, baseParams, totalPages, pageSize],
  );

  const pageSizeLink = useCallback(
    (size: number) => {
      return buildUrl(baseUrl, { ...baseParams, page: "1", limit: String(size) });
    },
    [baseUrl, baseParams],
  );

  const handlePageSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      window.location.href = pageSizeLink(Number(e.target.value));
    },
    [pageSizeLink],
  );

  return (
    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <label htmlFor="pageSize" className="text-sm text-ink-muted">
          Baris per halaman:
        </label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={handlePageSizeChange}
          className="rounded-lg border border-border/50 bg-surface/50 px-2.5 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-ink-muted">
        Menampilkan {start}-{end} dari {total} kupon
      </p>

      <div className="flex items-center gap-1">
        <Link
          href={pageLink(currentPage - 1)}
          aria-label="Halaman sebelumnya"
          className={`rounded-lg border border-border/50 bg-surface/50 px-3 py-1.5 text-sm font-semibold text-ink transition-all duration-200 hover:bg-brand/10 hover:text-brand disabled:cursor-not-allowed disabled:opacity-40 ${
            currentPage <= 1 ? "pointer-events-none opacity-40" : ""
          }`}
        >
          Sebelumnya
        </Link>

        <div className="flex items-center gap-0.5">
          {getPageNumbers(currentPage, totalPages).map((page, i) =>
            page === "ellipsis" ? (
              <span
                key={`ellipsis-${i}`}
                className="flex h-8 w-8 items-center justify-center text-sm text-ink-muted"
              >
                ...
              </span>
            ) : (
              <Link
                key={page}
                href={pageLink(page)}
                aria-label={`Halaman ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200 ${
                  page === currentPage
                    ? "bg-brand text-white"
                    : "border border-border/50 bg-surface/50 text-ink hover:bg-brand/10 hover:text-brand"
                }`}
              >
                {page}
              </Link>
            ),
          )}
        </div>

        <Link
          href={pageLink(currentPage + 1)}
          aria-label="Halaman berikutnya"
          className={`rounded-lg border border-border/50 bg-surface/50 px-3 py-1.5 text-sm font-semibold text-ink transition-all duration-200 hover:bg-brand/10 hover:text-brand disabled:cursor-not-allowed disabled:opacity-40 ${
            currentPage >= totalPages ? "pointer-events-none opacity-40" : ""
          }`}
        >
          Berikutnya
        </Link>
      </div>
    </div>
  );
}
