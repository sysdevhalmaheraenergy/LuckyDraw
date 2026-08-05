"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface AddCouponsFormProps {
  eventId: string;
  currentTotal: number;
  maxCoupons?: number;
}

const PRESET_VALUES = [10, 20, 50];

export function AddCouponsForm({ eventId, currentTotal, maxCoupons = 100_000 }: AddCouponsFormProps) {
  const router = useRouter();
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const newTotal = currentTotal + count;
  const remaining = Math.max(0, maxCoupons - currentTotal);
  const capacityPercent = (currentTotal / maxCoupons) * 100;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ additionalCoupons: count }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal menambah kupon.");
      }

      setCount(10);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  function handlePresetClick(value: number) {
    setCount(Math.min(value, remaining));
  }

  function handleIncrement() {
    if (count < remaining) {
      setCount(count + 1);
    }
  }

  function handleDecrement() {
    if (count > 1) {
      setCount(count - 1);
    }
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-surface/50 p-6 shadow-card backdrop-blur-xl">
      <div className="mb-4">
        <h3 className="font-display text-lg font-semibold text-ink">Tambah Kupon</h3>
        <p className="text-xs text-ink-muted">
          Tambahkan kupon baru untuk event ini ({currentTotal.toLocaleString()} /{" "}
          {maxCoupons.toLocaleString()} kupon)
        </p>
      </div>

      {/* Capacity Indicator */}
      <div className="mb-4 h-2 w-full rounded-full bg-surface-alt/50 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            capacityPercent < 50
              ? "bg-emerald-500"
              : capacityPercent < 80
                ? "bg-amber-500"
                : "bg-danger"
          }`}
          style={{ width: `${capacityPercent}%` }}
        />
      </div>

      <form onSubmit={handleAdd} className="space-y-4">
        <div>
          <label
            htmlFor={`add-coupons-${eventId}`}
            className="block text-xs font-semibold text-ink-muted"
          >
            Jumlah Kupon
          </label>
          <div className="mt-1 relative">
            <input
              id={`add-coupons-${eventId}`}
              type="number"
              min={1}
              max={remaining}
              value={count}
              onChange={(e) =>
                setCount(Math.max(1, Math.min(remaining, Number(e.target.value))))
              }
              required
              className="mt-1 block w-full rounded-xl border border-border bg-surface-alt px-4 pr-10 py-2.5 text-sm text-ink outline-none transition-colors duration-200 placeholder:text-ink-muted/50 focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            {/* Spinner buttons */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col">
              <button
                type="button"
                onClick={handleIncrement}
                disabled={count >= remaining || loading}
                className="cursor-pointer text-ink-muted hover:text-ink disabled:cursor-not-allowed"
                aria-label="Increase"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={handleDecrement}
                disabled={count <= 1 || loading}
                className="cursor-pointer text-ink-muted hover:text-ink disabled:cursor-not-allowed"
                aria-label="Decrease"
              >
                ▼
              </button>
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div>
          <p className="text-xs text-ink-muted mb-2">Atau pilih cepat:</p>
          <div className="flex flex-wrap gap-2">
            {PRESET_VALUES.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetClick(preset)}
                disabled={preset > remaining || loading}
                className="cursor-pointer rounded-full border border-border/50 bg-white/20 px-3 py-1 text-xs font-medium text-ink transition-all duration-200 hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-40"
              >
                +{preset}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-xl bg-brand/10 px-4 py-2.5">
          <p className="text-xs text-ink-muted">
            Setelah menambahkan: <span className="font-semibold text-ink">{newTotal.toLocaleString()}</span>{" "}
            kupon
          </p>
        </div>

        {error && (
          <p className="text-sm text-danger">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || count <= 0 || newTotal > maxCoupons}
          className="w-full cursor-pointer rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Menambah..." : "Tambahkan Kupon"}
        </button>
      </form>
    </div>
  );
}
