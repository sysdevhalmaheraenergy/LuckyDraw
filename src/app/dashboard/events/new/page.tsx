"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export default function NewEventPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [totalCoupons, setTotalCoupons] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: description || undefined, totalCoupons }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal membuat event.");
      }

      const data = await res.json();
      router.push(`/dashboard/events/${data.event.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/">
            <BrandMark />
          </Link>
          <Link
            href="/dashboard"
            className="cursor-pointer rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-surface-alt"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-lg">
          <Link
            href="/dashboard"
            className="mb-6 flex items-center gap-1.5 text-sm text-ink-muted transition-colors duration-200 hover:text-ink"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Kembali
          </Link>

          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Buat Event Baru
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Isi detail event lucky draw di bawah ini.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-ink">
                Nama Event
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Gathering Tahunan 2026"
                className="mt-2 block w-full rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-ink outline-none transition-colors duration-200 placeholder:text-ink-muted/50 focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>

            <div>
              <label htmlFor="desc" className="block text-sm font-semibold text-ink">
                Deskripsi <span className="text-ink-muted">(opsional)</span>
              </label>
              <textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Deskripsi singkat tentang event ini..."
                className="mt-2 block w-full resize-none rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-ink outline-none transition-colors duration-200 placeholder:text-ink-muted/50 focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>

            <div>
              <label htmlFor="total" className="block text-sm font-semibold text-ink">
                Jumlah Kupon
              </label>
              <input
                id="total"
                type="number"
                value={totalCoupons}
                onChange={(e) => setTotalCoupons(Math.max(1, Math.min(100_000, Number(e.target.value))))}
                min={1}
                max={100_000}
                required
                className="mt-2 block w-full rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-ink outline-none transition-colors duration-200 focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              <p className="mt-1.5 text-xs text-ink-muted">
                Kupon 1 sampai {totalCoupons.toLocaleString("id-ID")} akan dibuat otomatis.
              </p>
            </div>

            {error && (
              <div className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full cursor-pointer rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Membuat..." : "Buat Event"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}