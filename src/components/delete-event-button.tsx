"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface DeleteEventButtonProps {
  eventId: string;
  eventName: string;
}

export function DeleteEventButton({ eventId, eventName }: DeleteEventButtonProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Gagal menghapus event.");
        return;
      }

      setIsModalOpen(false);
      router.push("/dashboard");
    } catch {
      setError("Gagal menghapus event.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="group relative flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-white/30 text-ink-muted opacity-70 backdrop-blur-xl transition-all duration-200 hover:opacity-100 hover:bg-danger/10 hover:text-danger hover:shadow-lg cursor-pointer"
        title="Hapus event"
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
        title="Hapus Event"
        message={`Yakin ingin menghapus event "${eventName}"? Semua kupon dan hadiah akan dihapus. Aksi ini tidak bisa dibatalkan.`}
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

