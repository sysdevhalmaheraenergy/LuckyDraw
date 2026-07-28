"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function CouponExcludeButton({ eventId, couponNumber }: { eventId: string; couponNumber: number }) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleExclude() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/events/${eventId}/coupons/${couponNumber}/exclude`, {
        method: "PATCH",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Gagal mengecualikan kupon.");
        return;
      }

      setIsModalOpen(false);
      router.refresh();
    } catch {
      setError("Gagal mengecualikan kupon.");
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
        Kecualikan
      </button>

      <ConfirmDialog
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setError("");
        }}
        title="Kecualikan Kupon"
        message={`Yakin ingin mengecualikan kupon #${couponNumber}? Kupon yang dikecualikan tidak dapat diundi lagi.`}
        confirmLabel="Kecualikan"
        cancelLabel="Batal"
        variant="danger"
        loading={loading}
        error={error}
        onConfirm={handleExclude}
      />
    </>
  );
}
