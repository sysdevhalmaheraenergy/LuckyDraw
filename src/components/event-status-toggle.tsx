"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";

interface EventStatusToggleProps {
  eventId: string;
  currentStatus: string;
  hasPrizes: boolean;
}

export function EventStatusToggle({ eventId, currentStatus, hasPrizes }: EventStatusToggleProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  async function transitionTo(status: string) {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal mengubah status.");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {currentStatus === "DRAFT" && (
        <button
          onClick={() => transitionTo("ONGOING")}
          disabled={loading || !hasPrizes}
          className="cursor-pointer rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Memproses..." : "Mulai Undian"}
        </button>
      )}
      {currentStatus === "ONGOING" && (
        <button
          onClick={() => setIsCompleteModalOpen(true)}
          disabled={loading}
          className="cursor-pointer rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Memproses..." : "Selesaikan Undian"}
        </button>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}

      <ConfirmDialog
        isOpen={isCompleteModalOpen}
        onClose={() => {
          setIsCompleteModalOpen(false);
          setError("");
        }}
        title="Selesaikan Undian"
        message="Yakin ingin menyelesaikan undian? Aksi ini tidak bisa dibatalkan."
        confirmLabel="Selesaikan"
        cancelLabel="Batal"
        variant="warning"
        loading={loading}
        error={error}
        onConfirm={() => transitionTo("COMPLETED")}
      />
    </div>
  );
}
