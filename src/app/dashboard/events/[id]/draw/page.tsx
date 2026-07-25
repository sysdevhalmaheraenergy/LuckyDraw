"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { BrandMark } from "@/components/brand-mark";
import { StatusBadge } from "@/components/status-badge";
import { DrawCannon } from "@/components/draw-cannon";
import { tableRowVariants, getVariants } from "@/lib/motion";

interface Prize {
  id: string;
  name: string;
  description: string | null;
  drawOrder: number;
  status: string;
  imageUrl: string | null;
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
  const params = useParams();
  const id = params.id as string;
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawingPrizeId, setDrawingPrizeId] = useState<string | null>(null);
  const [animatingPrize, setAnimatingPrize] = useState<Prize | null>(null);
  const [winningNumber, setWinningNumber] = useState<number[] | null>(null);
  const [error, setError] = useState("");
  const shouldReduceMotion = useReducedMotion();
  const { container, item } = getVariants(!!shouldReduceMotion);

  const fetchEvent = useCallback(async () => {
    try {
      const res = await fetch(`/api/events/${id}`);
      if (res.status === 401) {
        window.location.href = `/login?callbackUrl=/dashboard/events/${id}/draw`;
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Gagal memuat data.");
      }
      const data = await res.json();
      setEvent(data.event);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data event.");
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchEvent();
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
      const prize = event?.prizes.find((p) => p.id === prizeId);
      if (prize) {
        const number = data.drawResult.coupon.number;
        const digits = String(number).padStart(6, "0").split("").map(Number);
        setWinningNumber(digits);
        setAnimatingPrize(prize);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      setDrawingPrizeId(null);
    }
  }

  function handleAnimationComplete() {
    setAnimatingPrize(null);
    setWinningNumber(null);
    setDrawingPrizeId(null);
    void fetchEvent();
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

      void fetchEvent();
    } catch {
      alert("Gagal undo.");
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="flex items-center gap-3 text-slate-300">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-electric border-t-transparent" />
          <span>Memuat...</span>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-900 to-slate-800 px-6 text-center">
        <p className="text-red-400">{error || "Event tidak ditemukan."}</p>
        <Link
          href="/dashboard"
          className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/20"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  const pendingPrizes = event.prizes.filter((p) => p.status === "PENDING");
  const drawnPrizes = event.prizes.filter((p) => p.status === "DRAWN");

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100"
      initial={false}
      animate="visible"
      variants={container}
    >
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 h-full w-full rounded-full bg-electric/5 blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 h-full w-full rounded-full bg-electric/5 blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <motion.div
          className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"
          variants={item}
        >
          <Link href="/">
            <BrandMark className="[&>span:last-child]:text-white" />
          </Link>
          <Link
            href={`/dashboard/events/${id}`}
            className="cursor-pointer rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition-all duration-200 hover:bg-white/20"
          >
            Detail Event
          </Link>
        </motion.div>
      </header>

      <main className="relative flex-1 px-6 py-10">
        <div className="mx-auto max-w-4xl">
          {/* Breadcrumb */}
          <motion.div variants={item}>
            <Link
              href={`/dashboard/events/${id}`}
              className="mb-6 flex items-center gap-1.5 text-sm text-slate-400 transition-colors duration-200 hover:text-slate-200"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {event.name}
            </Link>
          </motion.div>

          {/* Title */}
          <motion.div className="mb-8 flex items-center gap-4" variants={item}>
            <h1 className="font-display text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-200 text-transparent bg-clip-text sm:text-4xl">
              Pengundian
            </h1>
            <StatusBadge status={event.status} />
          </motion.div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Animation overlay - DrawCannon */}
          <AnimatePresence>
            {animatingPrize && winningNumber !== null && (
              <DrawCannon
                winningPrize={animatingPrize}
                winningNumber={winningNumber}
                onComplete={handleAnimationComplete}
              />
            )}
          </AnimatePresence>

          {/* Pending prizes */}
          {event.status === "ONGOING" && pendingPrizes.length > 0 && (
            <motion.section className="mb-10" variants={item}>
              <motion.h2
                className="mb-4 font-display text-lg font-semibold text-slate-200"
                variants={item}
              >
                Hadiah Belum Diundi
              </motion.h2>
              <motion.div
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                variants={container}
                initial={false}
                animate="visible"
              >
                {pendingPrizes.map((prize, index) => (
                  <motion.div
                    key={prize.id}
                    custom={index}
                    variants={item}
                    className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 shadow-glass backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/10"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-display text-lg font-bold text-white">{prize.name}</h3>
                      <span className="rounded-full bg-electric/20 px-2.5 py-0.5 text-xs font-semibold text-electric">
                        #{prize.drawOrder + 1}
                      </span>
                    </div>
                    {prize.description && (
                      <p className="mb-4 text-sm text-slate-400">{prize.description}</p>
                    )}
                    <motion.button
                      onClick={() => handleDraw(prize.id)}
                      disabled={drawingPrizeId === prize.id}
                      className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-electric to-electric-dark px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {drawingPrizeId === prize.id ? "Drawing..." : "Draw"}
                    </motion.button>
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>
          )}

          {/* Drawn prizes */}
          {drawnPrizes.length > 0 && (
            <motion.section className="mb-10" variants={item}>
              <motion.h2
                className="mb-4 font-display text-lg font-semibold text-slate-200"
                variants={item}
              >
                Hasil Undian
              </motion.h2>
              <motion.div
                className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 shadow-glass backdrop-blur-xl"
                variants={item}
              >
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="px-4 py-3 font-semibold text-slate-200">Hadiah</th>
                      <th className="px-4 py-3 font-semibold text-slate-200">Pemenenang</th>
                      <th className="px-4 py-3 font-semibold text-slate-200">Waktu</th>
                      <th className="px-4 py-3 font-semibold text-slate-200">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drawnPrizes.map((prize, i) => {
                      const validResult = prize.drawResults.find((r) => r.status === "VALID");
                      return (
                        <motion.tr
                          key={prize.id}
                          custom={i}
                          variants={tableRowVariants}
                          initial={false}
                          animate="visible"
                          className="border-b border-white/5 last:border-b-0 hover:bg-white/5"
                        >
                          <td className="px-4 py-3 font-semibold text-white">{prize.name}</td>
                          <td className="px-4 py-3 font-display font-bold text-emerald-400">
                            {validResult ? `#${validResult.coupon.number}` : "-"}
                          </td>
                          <td className="px-4 py-3 text-slate-400">
                            {validResult ? new Date(validResult.drawnAt).toLocaleString("id-ID") : "-"}
                          </td>
                          <td className="px-4 py-3">
                            {validResult && event.status === "ONGOING" && (
                              <motion.button
                                onClick={() => handleUndo(validResult.id)}
                                className="cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold text-amber-400 transition-colors duration-200 hover:bg-amber-400/10"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Batalkan
                              </motion.button>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </motion.div>
            </motion.section>
          )}

          {/* Empty state */}
          {pendingPrizes.length === 0 && drawnPrizes.length === 0 && (
            <motion.div
              className="rounded-2xl border border-dashed border-white/20 bg-white/5 px-6 py-16 text-center shadow-glass backdrop-blur-xl"
              variants={item}
            >
              <motion.div
                className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-electric/10 text-electric"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </motion.div>
              <h2 className="font-display text-lg font-semibold text-white">Belum ada hadiah</h2>
              <p className="max-w-sm text-sm text-slate-400">
                Tambah hadiah dulu sebelum memulai pengundian.
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </motion.div>
  );
}
