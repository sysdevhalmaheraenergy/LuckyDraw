"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function CouponDeleteButton({ eventId, couponNumber }: { eventId: string; couponNumber: number }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/events/${eventId}/coupons/${couponNumber}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Gagal menghapus kupon.");
        return;
      }

      setIsModalOpen(false);
      router.refresh();
    } catch {
      setError("Gagal menghapus kupon.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold text-danger transition-colors duration-200 hover:bg-danger/10"
      >
        Hapus
      </button>

      <ConfirmDialog
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setError("");
        }}
        title="Hapus Kupon"
        message={`Yakin ingin menghapus kupon #${couponNumber}? Aksi ini tidak bisa dibatalkan.`}
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
