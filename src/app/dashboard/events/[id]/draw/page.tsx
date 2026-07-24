"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { StatusBadge } from "@/components/status-badge";
import { DrawAnimation } from "@/components/draw-animation";

interface Prize {
  id: string;
  name: string;
  description: string | null;
  drawOrder: number;
  status: string;
  drawResults: Array<{
    id: string;
    status: string;
    drawnAt: string;
    coupon: { number: number };
  }>;
}

interface EventData {
  id: string;
  name: string;
  status: string;
  prizes: Prize[];
}

export default function DrawPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawingPrizeId, setDrawingPrizeId] = useState<string | null>(null);
  const [animatingPrizeId, setAnimatingPrizeId] = useState<string | null>(null);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [error, setError] = useState("");

  const fetchEvent = useCallback(async () => {
    try {
      const res = await fetch(`/api/events/${id}`);
      if (!res.ok) throw new Error("Gagal memuat data.");
      const data = await res.json();
      setEvent(data.event);
    } catch {
      setError("Gagal memuat data event.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  async function handleDraw(prizeId: string) {
    setDrawingPrizeId(prizeId);
    setError("");

    try {
      const res = await fetch(`/api/events/${id}/prizes/${prizeId}/draw`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal mengundi.");
      }

      const data = await res.json();
      setWinningNumber(data.drawResult.coupon.number);
      setAnimatingPrizeId(prizeId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      setDrawingPrizeId(null);
    }
  }

  function handleAnimationComplete() {
    setAnimatingPrizeId(null);
    setWinningNumber(null);
    setDrawingPrizeId(null);
    fetchEvent();
  }

  async function handleUndo(resultId: string) {
    try {
      const res = await fetch(`/api/draw-results/${resultId}/undo`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "Gagal undo.");
      }

      fetchEvent();
    } catch {
      alert("Gagal undo.");
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-ink-muted">Memuat...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-danger">{error || "Event tidak ditemukan."}</p>
      </div>
    );
  }

  const pendingPrizes = event.prizes.filter((p) => p.status === "PENDING");
  const drawnPrizes = event.prizes.filter((p) => p.status === "DRAWN");

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/">
            <BrandMark />
          </Link>
          <Link
            href={`/dashboard/events/${id}`}
            className="cursor-pointer rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-surface-alt"
          >
            Detail Event
          </Link>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <Link
            href={`/dashboard/events/${id}`}
            className="mb-6 flex items-center gap-1.5 text-sm text-ink-muted transition-colors duration-200 hover:text-ink"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {event.name}
          </Link>

          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Pengundian
            </h1>
            <StatusBadge status={event.status} />
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          {/* Animation overlay */}
          {animatingPrizeId && winningNumber !== null && (
            <div className="mt-8 flex justify-center">
              <DrawAnimation winningNumber={winningNumber} onComplete={handleAnimationComplete} />
            </div>
          )}

          {/* Pending prizes */}
          {event.status === "ONGOING" && pendingPrizes.length > 0 && (
            <section className="mt-8">
              <h2 className="font-display text-lg font-semibold text-ink">Hadiah Belum Diundi</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {pendingPrizes.map((prize) => (
                  <div
                    key={prize.id}
                    className="rounded-2xl border border-border bg-surface-alt p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-base font-semibold text-ink">{prize.name}</h3>
                        <p className="text-xs text-ink-muted">Undian ke-{prize.drawOrder + 1}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDraw(prize.id)}
                      disabled={drawingPrizeId === prize.id}
                      className="mt-4 w-full cursor-pointer rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {drawingPrizeId === prize.id ? "Mengundi..." : "Undi"}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Drawn prizes */}
          {drawnPrizes.length > 0 && (
            <section className="mt-8">
              <h2 className="font-display text-lg font-semibold text-ink">Hasil Undian</h2>
              <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface">
                      <th className="px-4 py-3 font-semibold text-ink">Hadiah</th>
                      <th className="px-4 py-3 font-semibold text-ink">Pemenang</th>
                      <th className="px-4 py-3 font-semibold text-ink">Waktu</th>
                      <th className="px-4 py-3 font-semibold text-ink">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drawnPrizes.map((prize) => {
                      const validResult = prize.drawResults.find((r) => r.status === "VALID");
                      return (
                        <tr key={prize.id} className="border-b border-border last:border-b-0 hover:bg-surface/50">
                          <td className="px-4 py-3 font-semibold text-ink">{prize.name}</td>
                          <td className="px-4 py-3 font-display font-bold text-emerald-500">
                            {validResult ? `#${validResult.coupon.number}` : "-"}
                          </td>
                          <td className="px-4 py-3 text-ink-muted">
                            {validResult
                              ? new Date(validResult.drawnAt).toLocaleString("id-ID")
                              : "-"}
                          </td>
                          <td className="px-4 py-3">
                            {validResult && event.status === "ONGOING" && (
                              <button
                                onClick={() => handleUndo(validResult.id)}
                                className="cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold text-warning transition-colors duration-200 hover:bg-warning/10"
                              >
                                Batalkan
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {pendingPrizes.length === 0 && drawnPrizes.length === 0 && (
            <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface-alt px-6 py-16 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand/10 text-brand">
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <h2 className="font-display text-lg font-semibold text-ink">Belum ada hadiah</h2>
              <p className="max-w-sm text-sm text-ink-muted">
                Tambah hadiah dulu sebelum memulai pengundian.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}