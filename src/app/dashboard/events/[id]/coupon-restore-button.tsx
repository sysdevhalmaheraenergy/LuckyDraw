"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function CouponRestoreButton({ eventId, couponNumber }: { eventId: string; couponNumber: number }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRestore() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/events/${eventId}/coupons/${couponNumber}/restore`, {
        method: "PATCH",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Gagal memulihkan kupon.");
        return;
      }

      setIsModalOpen(false);
      router.refresh();
    } catch {
      setError("Gagal memulihkan kupon.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold text-warning transition-colors duration-200 hover:bg-warning/10"
      >
        Pulihkan
      </button>

      <ConfirmDialog
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setError("");
        }}
        title="Pulihkan Kupon"
        message={`Yakin ingin memulihkan kupon #${couponNumber}? Kupon ini akan kembali tersedia untuk diundi.`}
        confirmLabel="Pulihkan"
        cancelLabel="Batal"
        variant="warning"
        loading={loading}
        error={error}
        onConfirm={handleRestore}
      />
    </>
  );
}
