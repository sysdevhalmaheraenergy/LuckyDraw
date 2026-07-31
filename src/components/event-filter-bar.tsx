"use client";

import { useCallback } from "react";

interface EventFilterBarProps {
  currentStatus: string;
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Semua" },
  { value: "DRAFT", label: "Draft" },
  { value: "ONGOING", label: "Berlangsung" },
  { value: "COMPLETED", label: "Selesai" },
];

export function EventFilterBar({ currentStatus }: EventFilterBarProps) {
  const updateUrl = useCallback((status: string) => {
    const url = new URL(window.location.href);
    if (status) {
      url.searchParams.set("status", status);
    } else {
      url.searchParams.delete("status");
    }
    window.location.href = url.toString();
  }, []);

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 mt-6">
      {STATUS_OPTIONS.map((opt) => {
        const isActive = currentStatus === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => updateUrl(opt.value)}
            className={
              isActive
                ? "cursor-pointer rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-brand/30 transition-all duration-200"
                : "cursor-pointer rounded-full border border-border/50 bg-white/30 px-4 py-2 text-xs font-semibold text-ink-muted transition-all duration-200 hover:border-brand/40 hover:bg-white/40 hover:text-ink"
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
