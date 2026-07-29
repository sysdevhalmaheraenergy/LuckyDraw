"use client";

import { useCallback } from "react";
import Select from "react-select";
import type { StylesConfig } from "react-select";

interface StatusOption {
  value: string;
  label: string;
}

const STATUS_OPTIONS: StatusOption[] = [
  { value: "", label: "Semua" },
  { value: "AVAILABLE", label: "Tersedia" },
  { value: "WON", label: "Menang" },
  { value: "EXCLUDED", label: "Dikecualikan" },
];

const selectStyles: StylesConfig<StatusOption, false> = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderColor: state.isFocused ? "rgba(124, 54, 237, 0.5)" : "rgba(230, 225, 245, 0.5)",
    borderRadius: "0.75rem",
    backdropFilter: "blur(12px)",
    boxShadow: "none",
    minHeight: "2.5rem",
    "&:hover": {
      borderColor: state.isFocused ? "rgba(124, 54, 237, 0.5)" : "rgba(230, 225, 245, 0.7)",
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(12px)",
    borderRadius: "0.75rem",
    border: "1px solid rgba(230, 225, 245, 0.5)",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    zIndex: 50,
  }),
  option: (base, { isSelected, isFocused }) => ({
    ...base,
    backgroundColor: isSelected
      ? "rgba(124, 54, 237, 0.1)"
      : isFocused
        ? "rgba(124, 54, 237, 0.05)"
        : "transparent",
    color: isSelected ? "#7c3aed" : "#160f2e",
    padding: "0.5rem 0.75rem",
    cursor: "pointer",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#160f2e",
  }),
  input: (base) => ({
    ...base,
    color: "#160f2e",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#5b5470",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "#5b5470",
    "&:hover": {
      color: "#7c3aed",
    },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: "#5b5470",
    "&:hover": {
      color: "#ef4444",
    },
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
};

interface CouponFilterBarProps {
  currentStatus: string;
  currentSearch: string;
}

export function CouponFilterBar({ currentStatus, currentSearch }: CouponFilterBarProps) {
  const updateUrl = useCallback((updates: Record<string, string>) => {
    const url = new URL(window.location.href);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }
    });
    url.searchParams.set("page", "1");
    window.location.href = url.toString();
  }, []);

  const handleStatusChange = useCallback(
    (selected: StatusOption | null) => {
      updateUrl({ status: selected?.value ?? "" });
    },
    [updateUrl],
  );

  const handleSearch = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        updateUrl({ search: e.currentTarget.value.trim() });
      }
    },
    [updateUrl],
  );

  const selectedOption = STATUS_OPTIONS.find((o) => o.value === currentStatus);

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <input
          type="text"
          placeholder="Cari nomor kupon kemudian tekan enter..."
          defaultValue={currentSearch}
          onKeyDown={handleSearch}
          aria-label="Cari nomor kupon"
          className="w-full rounded-xl border border-border/50 bg-surface/50 px-3 py-2 pl-9 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
          aria-hidden="true"
        >
          <path
            d="M21 21l-4.35-4.35M5 11a6 6 0 1112 0 6 6 0 01-12 0z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="w-full sm:w-60">
        <Select
          instanceId="coupon-status-filter"
          value={selectedOption}
          onChange={handleStatusChange}
          options={STATUS_OPTIONS}
          isClearable
          isSearchable={false}
          styles={selectStyles}
          placeholder="Filter status..."
          aria-label="Filter status kupon"
        />
      </div>
    </div>
  );
}
