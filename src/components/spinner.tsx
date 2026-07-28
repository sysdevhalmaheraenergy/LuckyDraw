"use client";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  centered?: boolean;
}

const sizeMap = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-8 w-8",
};

export function Spinner({ size = "md", label, centered = false }: SpinnerProps) {
  return (
    <div
      className={
        centered
          ? "flex items-center justify-center py-8"
          : "flex items-center"
      }
    >
      <div
        className={`animate-spin rounded-full border-2 border-brand border-t-transparent ${sizeMap[size]}`}
      />
      {label && (
        <span className="ml-2 text-sm text-ink-muted">{label}</span>
      )}
    </div>
  );
}