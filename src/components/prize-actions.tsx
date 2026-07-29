"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface PrizeActionsProps {
  eventId: string;
  prizeId: string;
  prizeName: string;
}

export function PrizeActions({ eventId, prizeId, prizeName }: PrizeActionsProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/events/${eventId}/prizes/${prizeId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Gagal menghapus hadiah.");
        return;
      }

      setIsModalOpen(false);
      router.refresh();
    } catch {
      setError("Gagal menghapus hadiah.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <a
        href={`/dashboard/events/${eventId}/prizes/${prizeId}/edit`}
        className="group relative flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-white/30 text-ink-muted opacity-70 backdrop-blur-xl transition-all duration-200 hover:opacity-100 hover:bg-white/50 hover:text-ink hover:shadow-lg"
        title="Edit hadiah"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
          <path
            d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16.5 3.5a2.5 2.5 0 1 1 3.5 3.5L12 15l-4 1 1-4 8.5-8.5z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="group relative flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-white/30 text-ink-muted opacity-70 backdrop-blur-xl transition-all duration-200 hover:opacity-100 hover:bg-danger/10 hover:text-danger hover:shadow-lg cursor-pointer"
        title="Hapus hadiah"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
          <path
            d="M6 7v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M10 11v6M14 11v6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M9 7V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path d="M4 7h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      <ConfirmDialog
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setError("");
        }}
        title="Hapus Hadiah"
        message={`Yakin ingin menghapus hadiah "${prizeName}"? Aksi ini tidak bisa dibatalkan.`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        variant="danger"
        loading={loading}
        error={error}
        onConfirm={handleDelete}
      />
    </>
  );
}
