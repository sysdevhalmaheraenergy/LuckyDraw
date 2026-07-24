"use client";

import { useRouter } from "next/navigation";

interface PrizeActionsProps {
  eventId: string;
  prizeId: string;
  prizeName: string;
}

export function PrizeActions({ eventId, prizeId, prizeName }: PrizeActionsProps) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Yakin ingin menghapus hadiah "${prizeName}"?`)) return;

    const res = await fetch(`/api/events/${eventId}/prizes/${prizeId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <>
      <a
        href={`/dashboard/events/${eventId}/prizes/${prizeId}/edit`}
        className="cursor-pointer rounded-lg p-1 text-ink-muted transition-colors duration-200 hover:text-ink hover:bg-surface"
        title="Edit hadiah"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16.5 3.5a2.5 2.5 0 1 1 3.5 3.5L12 15l-4 1 1-4 8.5-8.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
      <button
        type="button"
        onClick={handleDelete}
        className="cursor-pointer rounded-lg p-1 text-ink-muted transition-colors duration-200 hover:text-danger hover:bg-surface"
        title="Hapus hadiah"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
          <path d="M6 7v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 7V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 7h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </>
  );
}
