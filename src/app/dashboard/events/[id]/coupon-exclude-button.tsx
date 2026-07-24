"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CouponExcludeButton({ eventId, couponNumber }: { eventId: string; couponNumber: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleExclude() {
    if (!confirm(`Yakin ingin mengecualikan kupon #${couponNumber}?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/coupons/${couponNumber}/exclude`, {
        method: "PATCH",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Gagal mengecualikan kupon.");
      }

      router.refresh();
    } catch {
      alert("Gagal mengecualikan kupon.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleExclude}
      disabled={loading}
      className="cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold text-danger transition-colors duration-200 hover:bg-danger/10 disabled:opacity-40"
    >
      {loading ? "..." : "Kecualikan"}
    </button>
  );
}