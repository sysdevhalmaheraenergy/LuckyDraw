"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard-header";
import { StatusBadge } from "@/components/status-badge";
import { DrawCannon } from "@/components/draw-cannon";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Modal } from "@/components/modal";
import { DrawResultNoteModal } from "@/components/draw-result-note-modal";
import { DrawResultActions } from "@/components/draw-result-actions";
import { tableRowVariants, getVariants } from "@/lib/motion";

interface DrawResult {
  id: string;
  status: string;
  drawnAt: string;
  note: string | null;
  imageUrl: string | null;
  coupon: { number: number };
}

interface Prize {
  id: string;
  name: string;
  description: string | null;
  drawOrder: number;
  status: string;
  imageUrl: string | null;
  drawResults: DrawResult[];
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
  const [undoConfirmOpen, setUndoConfirmOpen] = useState(false);
  const [pendingUndoResultId, setPendingUndoResultId] = useState<string | null>(null);
  const [undoLoading, setUndoLoading] = useState(false);
  const [undoError, setUndoError] = useState("");
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [viewNoteModalOpen, setViewNoteModalOpen] = useState(false);
  const [viewNoteContent, setViewNoteContent] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { container, item } = getVariants(!!shouldReduceMotion);

  const toggleFullscreen = useCallback(async () => {
    try {
      const elem = document.documentElement;
      if (!document.fullscreenElement) {
        await elem.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen request failed:", err);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

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

  function requestUndo(resultId: string) {
    setPendingUndoResultId(resultId);
    setUndoError("");
    setUndoConfirmOpen(true);
  }

  async function confirmUndo() {
    if (!pendingUndoResultId) return;

    setUndoLoading(true);
    setUndoError("");

    try {
      const res = await fetch(`/api/draw-results/${pendingUndoResultId}/undo`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        setUndoError(data.error ?? "Gagal membatalkan undian.");
        return;
      }

      setUndoConfirmOpen(false);
      setPendingUndoResultId(null);
      void fetchEvent();
    } catch {
      setUndoError("Gagal membatalkan undian.");
    } finally {
      setUndoLoading(false);
    }
  }

  function openNoteModal(resultId: string) {
    setSelectedResultId(resultId);
    setNoteModalOpen(true);
  }

  function openViewNoteModal(_resultId: string, note: string) {
    setViewNoteContent(note);
    setViewNoteModalOpen(true);
  }

  const selectedResult = selectedResultId
    ? (() => {
        const prize = event?.prizes.find((p) =>
          p.drawResults.some((r) => r.id === selectedResultId),
        );
        return prize?.drawResults.find((r) => r.id === selectedResultId);
      })()
    : null;

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface">
        <div className="flex items-center gap-3 text-ink-muted">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          <span>Memuat...</span>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
        <p className="text-danger">{error || "Event tidak ditemukan."}</p>
        <Link
          href="/dashboard"
          className="rounded-full border border-border/50 bg-white/30 px-4 py-2 text-sm font-semibold text-ink transition-all duration-200 hover:bg-white/40"
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
      className="min-h-screen bg-surface text-ink"
      initial={false}
      animate="visible"
      variants={container}
    >
      {/* Glass background overlay */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-brand/5 via-transparent to-emerald-500/5" />
      <div className="fixed inset-0 -z-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand/10 via-transparent to-transparent opacity-30" />

      {/* Header */}
      <DashboardHeader
        rightSlot={
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? "Keluar Fullscreen" : "Fullscreen"}
              className="cursor-pointer rounded-full border border-border/50 bg-white/20 p-2 text-ink transition-all duration-200 hover:border-brand/40 hover:text-brand hover:bg-white/30"
              aria-label="Toggle fullscreen"
            >
              {isFullscreen ? (
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
              )}
            </button>
            <Link
              href={`/dashboard/events/${id}`}
              className="cursor-pointer rounded-full border border-border/50 bg-white/20 px-4 py-2 text-sm font-semibold text-ink transition-all duration-200 hover:border-brand/40 hover:text-brand hover:bg-white/30"
            >
              Detail Event
            </Link>
          </div>
        }
      />

      <main className="relative flex-1 px-6 py-10">
        <div className="mx-auto max-w-4xl">
          {/* Breadcrumb */}
          <motion.div variants={item}>
            <Link
              href={`/dashboard/events/${id}`}
              className="mb-6 flex items-center gap-1.5 text-sm text-ink-muted transition-colors duration-200 hover:text-ink"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {event.name}
            </Link>
          </motion.div>

          {/* Title */}
          <motion.div className="mb-8 flex items-center gap-4" variants={item}>
            <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Pengundian
            </h1>
            <StatusBadge status={event.status} />
          </motion.div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="mb-6 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
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
                className="mb-4 font-display text-lg font-semibold text-ink"
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
                    className="group relative rounded-2xl border border-border/50 bg-surface/50 p-6 shadow-glass backdrop-blur-xl transition-all duration-300 hover:border-brand/30 hover:bg-surface/80"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-display text-lg font-bold text-ink">{prize.name}</h3>
                      <span className="rounded-full bg-brand/20 px-2.5 py-0.5 text-xs font-semibold text-brand">
                        #{prize.drawOrder}
                      </span>
                    </div>
                    {prize.description && (
                      <p className="mb-4 text-sm text-ink-muted">{prize.description}</p>
                    )}
                    {prize.imageUrl && (
                      <img
                        src={prize.imageUrl}
                        alt={prize.name}
                        className="mb-4 h-48 w-full rounded-xl object-contain ring-1 ring-border/50"
                      />
                    )}
                    <motion.button
                      onClick={() => handleDraw(prize.id)}
                      disabled={drawingPrizeId === prize.id}
                      className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-brand to-brand-2 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-all duration-200 hover:scale-105 hover:shadow-glass-glow disabled:opacity-50"
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
                className="mb-4 font-display text-lg font-semibold text-ink"
                variants={item}
              >
                Hasil Undian
              </motion.h2>
              <motion.div
                className="rounded-2xl border border-border/50 bg-surface/50 shadow-glass backdrop-blur-xl"
                variants={item}
              >
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-surface/50">
                      <th className="px-4 py-3 font-semibold text-ink">Hadiah</th>
                      <th className="px-4 py-3 font-semibold text-ink">Pemenang</th>
                      <th className="px-4 py-3 font-semibold text-ink">Waktu</th>
                      <th className="px-4 py-3 font-semibold text-ink">Aksi</th>
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
                          className="border-b border-border/50 last:border-b-0 hover:bg-surface/50"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {prize.imageUrl && (
                                <img
                                  src={prize.imageUrl}
                                  alt={prize.name}
                                  className="h-10 w-10 rounded-lg object-cover"
                                />
                              )}
                              <span className="font-semibold text-ink">{prize.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-display font-bold text-emerald-500">
                            {validResult ? `#${validResult.coupon.number}` : "-"}
                          </td>
                          <td className="px-4 py-3 text-ink-muted">
                            {validResult ? new Date(validResult.drawnAt).toLocaleString("id-ID") : "-"}
                          </td>
                          <td className="px-4 py-3">
                            {validResult ? (
                              <DrawResultActions
                                resultId={validResult.id}
                                note={validResult.note}
                                canUndo={event.status === "ONGOING"}
                                onUndo={requestUndo}
                                onEditNote={openNoteModal}
                                onViewNote={openViewNoteModal}
                              />
                            ) : (
                              "-"
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
              className="rounded-2xl border border-dashed border-border/50 bg-surface/50 px-6 py-16 text-center shadow-glass backdrop-blur-xl"
              variants={item}
            >
              <motion.div
                className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-brand/10 text-brand"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </motion.div>
              <h2 className="font-display text-lg font-semibold text-ink">Belum ada hadiah</h2>
              <p className="max-w-sm text-sm text-ink-muted">
                Tambah hadiah dulu sebelum memulai pengundian.
              </p>
            </motion.div>
          )}
        </div>
      </main>

      <ConfirmDialog
        isOpen={undoConfirmOpen}
        onClose={() => {
          setUndoConfirmOpen(false);
          setPendingUndoResultId(null);
          setUndoError("");
        }}
        title="Batalkan Hasil Undian"
        message={
          pendingUndoResultId
            ? (() => {
                const prizeName = event?.prizes.find((p) =>
                  p.drawResults.some((r) => r.id === pendingUndoResultId),
                )?.name;
                return `Yakin ingin membatalkan hasil undian untuk hadiah "${prizeName}"? Kupon akan tersedia kembali untuk undian.`;
              })()
            : "Yakin ingin membatalkan hasil undian? Kupon akan tersedia kembali untuk undian."
        }
        confirmLabel="Batalkan Undian"
        cancelLabel="Batal"
        variant="warning"
        loading={undoLoading}
        error={undoError}
        onConfirm={confirmUndo}
      />

      <DrawResultNoteModal
        isOpen={noteModalOpen}
        onClose={() => {
          setNoteModalOpen(false);
          setSelectedResultId(null);
        }}
        resultId={selectedResultId ?? ""}
        existingNote={selectedResult?.note ?? ""}
        onSuccess={() => {
          setNoteModalOpen(false);
          setSelectedResultId(null);
          void fetchEvent();
        }}
      />

      <Modal
        isOpen={viewNoteModalOpen}
        onClose={() => setViewNoteModalOpen(false)}
        title="Lihat Catatan"
        size="md"
      >
        <div className="space-y-3">
          <p className="text-sm text-ink whitespace-pre-wrap break-words">
            {viewNoteContent || "(Tidak ada catatan)"}
          </p>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={() => setViewNoteModalOpen(false)}
            className="cursor-pointer rounded-lg border border-border/50 bg-white/30 px-4 py-2 text-sm font-semibold text-ink-muted transition-all duration-200 hover:bg-white/50 hover:text-ink"
          >
            Tutup
          </button>
        </div>
      </Modal>
    </motion.div>
  );
}
