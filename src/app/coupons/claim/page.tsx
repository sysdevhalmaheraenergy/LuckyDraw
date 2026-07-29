"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export default function ClaimCouponPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ coupon: { number: number }; event: { name: string } } | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/coupons/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal mengklaim kupon.");
      }

      const data = await res.json();
      setResult(data);
      setCode("");
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
          <div className="flex items-center gap-4">
            <Link
              href="/events"
              className="cursor-pointer rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-surface-alt"
            >
              Event
            </Link>
            <Link
              href="/login"
              className="cursor-pointer rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-md">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Klaim Kupon
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Masukkan kode kupon yang kamu dapatkan untuk mengikuti undian.
          </p>

          {!result ? (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-semibold text-ink">
                  Kode Kupon
                </label>
                <input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  placeholder="cm8b3..."
                  className="mt-2 block w-full rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-ink outline-none transition-colors duration-200 placeholder:text-ink-muted/50 focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
                <p className="mt-1.5 text-xs text-ink-muted">
                  Masukkan ID kupon yang tertera di kupon fisik atau digital kamu.
                </p>
              </div>

              {error && (
                <div className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="w-full cursor-pointer rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? "Memproses..." : "Klaim Kupon"}
              </button>
            </form>
          ) : (
            <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-500">
                <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="mt-4 font-display text-xl font-bold text-emerald-500">
                Selamat! Kupon Anda Terdaftar
              </h2>
              <p className="mt-2 text-sm text-ink-muted">
                Kupon <span className="font-semibold text-ink">#{result.coupon.number}</span> untuk event{" "}
                <span className="font-semibold text-ink">{result.event.name}</span> berhasil diklaim.
              </p>
              <button
                onClick={() => setResult(null)}
                className="mt-6 cursor-pointer rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90"
              >
                Klaim Kupon Lain
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}