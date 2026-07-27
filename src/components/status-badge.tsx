const styles: Record<string, string> = {
  DRAFT: "bg-ink-muted/10 text-ink-muted",
  ONGOING: "bg-accent/15 text-accent",
  COMPLETED: "bg-emerald-500/15 text-emerald-500",
  AVAILABLE: "bg-emerald-500/15 text-emerald-500",
  WON: "bg-brand/15 text-brand",
  EXCLUDED: "bg-danger/15 text-danger",
  PENDING: "bg-warning/15 text-warning",
  DRAWN: "bg-brand/15 text-brand",
  VALID: "bg-emerald-500/15 text-emerald-500",
  UNDONE: "bg-ink-muted/10 text-ink-muted",
};

const labels: Record<string, string> = {
  DRAFT: "Draft",
  ONGOING: "Berlangsung",
  COMPLETED: "Selesai",
  AVAILABLE: "Tersedia",
  WON: "Menang",
  EXCLUDED: "Dikecualikan",
  PENDING: "Menunggu Diundi",
  DRAWN: "Diundi",
  VALID: "Sah",
  UNDONE: "Dibatalkan",
};

export function StatusBadge({ status, className = "" }: { status: string; className?: string }) {
  return (
    <span
      className={`inline-block shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status] ?? "bg-ink-muted/10 text-ink-muted"} ${className}`}
    >
      {labels[status] ?? status}
    </span>
  );
}