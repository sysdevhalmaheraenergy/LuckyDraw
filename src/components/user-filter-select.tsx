"use client";

import { useCallback } from "react";
import Select from "react-select";
import type { StylesConfig } from "react-select";

interface UserFilterSelectProps {
  users: { id: string; name: string | null; email: string | null }[];
  currentUserId: string;
}

interface UserOption {
  value: string;
  label: string;
}

const selectStyles: StylesConfig<UserOption, false> = {
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

export function UserFilterSelect({ users, currentUserId }: UserFilterSelectProps) {
  const options: UserOption[] = [
    { value: "", label: "Semua Pengguna" },
    ...users.map((u) => ({
      value: u.id,
      label: u.name ?? u.email ?? "",
    })),
  ];

  const selectedOption = options.find((o) => o.value === currentUserId);

  const updateUrl = useCallback((userId: string) => {
    const url = new URL(window.location.href);
    if (userId) {
      url.searchParams.set("userId", userId);
    } else {
      url.searchParams.delete("userId");
    }
    window.location.href = url.toString();
  }, []);

  return (
    <div className="mb-6 w-full sm:w-64">
      <Select
        instanceId="user-filter-select"
        value={selectedOption}
        onChange={(selected) => updateUrl(selected?.value ?? "")}
        options={options}
        isClearable
        isSearchable
        styles={selectStyles}
        placeholder="Filter pengguna..."
        aria-label="Filter event berdasarkan pengguna"
        noOptionsMessage={() => "Tidak ada pengguna"}
      />
    </div>
  );
}
