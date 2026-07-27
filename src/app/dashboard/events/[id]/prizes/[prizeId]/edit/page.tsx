"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard-header";

export default function EditPrizePage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const prizeId = params.prizeId as string;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [drawOrder, setDrawOrder] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPrize() {
      try {
        const res = await fetch(`/api/events/${eventId}/prizes/${prizeId}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Gagal memuat hadiah.");
        }
        const { prize } = await res.json();
        setName(prize.name);
        setDescription(prize.description ?? "");
        setImageUrl(prize.imageUrl ?? "");
        setDrawOrder(prize.drawOrder);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      }
    }
    fetchPrize();
  }, [eventId, prizeId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!eventId || !prizeId) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/events/${eventId}/prizes/${prizeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || undefined,
          imageUrl: imageUrl || undefined,
          drawOrder,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal mengedit hadiah.");
      }

      router.push(`/dashboard/events/${eventId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex flex-1 flex-col">
      {/* Glass background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-brand/5 via-transparent to-emerald-500/5" />

      <DashboardHeader
        rightSlot={
          <Link
            href={eventId ? `/dashboard/events/${eventId}` : "/dashboard"}
            className="cursor-pointer rounded-full border border-border/50 bg-white/20 px-4 py-2 text-sm font-semibold text-ink transition-all duration-200 hover:border-brand/40 hover:text-brand hover:bg-white/30"
          >
            Kembali
          </Link>
        }
      />

      <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-lg">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Edit Hadiah
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Perbarui detail hadiah yang akan diundi.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-5 sm:space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-ink">
                Nama Hadiah
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Hadiah Utama"
                className="mt-2 block w-full rounded-xl border border-border/50 bg-white/50 px-4 py-2.5 text-sm text-ink outline-none transition-all duration-200 placeholder:text-ink-muted/50 focus:border-brand focus:ring-2 focus:ring-brand/20 backdrop-blur-sm"
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
                placeholder="Deskripsi hadiah..."
                className="mt-2 block w-full resize-none rounded-xl border border-border/50 bg-white/50 px-4 py-2.5 text-sm text-ink outline-none transition-all duration-200 placeholder:text-ink-muted/50 focus:border-brand focus:ring-2 focus:ring-brand/20 backdrop-blur-sm"
              />
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-semibold text-ink">
                Gambar <span className="text-ink-muted">(opsional)</span>
              </label>
              <input
                id="image"
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  setUploading(true);
                  setError("");

                  try {
                    const formData = new FormData();
                    formData.append("file", file);

                    const res = await fetch("/api/upload/prizes", {
                      method: "POST",
                      body: formData,
                    });

                    if (!res.ok) {
                      const data = await res.json();
                      throw new Error(data.error ?? "Gagal mengunggah gambar.");
                    }

                    const data = await res.json();
                    setImageUrl(data.dataUrl);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
                  } finally {
                    setUploading(false);
                  }
                }}
                className="mt-2 block w-full text-sm text-ink file:mr-4 file:rounded-xl file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:opacity-90"
              />
              <p className="mt-1.5 text-xs text-ink-muted">
                Format: JPG, JPEG, PNG. Maksimal 500 KB.
              </p>
              {uploading && (
                <p className="mt-2 text-sm text-ink">Mengunggah gambar...</p>
              )}
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="mt-2 h-32 w-full rounded-xl object-cover ring-1 ring-border/50"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              )}
            </div>

            <div>
              <label htmlFor="order" className="block text-sm font-semibold text-ink">
                Urutan Undian
              </label>
              <input
                id="order"
                type="number"
                value={drawOrder}
                onChange={(e) => setDrawOrder(Math.max(0, Number(e.target.value)))}
                min={0}
                required
                className="mt-2 block w-full rounded-xl border border-border/50 bg-white/50 px-4 py-2.5 text-sm text-ink outline-none transition-all duration-200 focus:border-brand focus:ring-2 focus:ring-brand/20 backdrop-blur-sm"
              />
              <p className="mt-1.5 text-xs text-ink-muted">
                0 = undian pertama, 1 = undian kedua, dst.
              </p>
            </div>

            {error && (
              <div className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || uploading || !name.trim() || !eventId}
              className="w-full cursor-pointer rounded-xl bg-gradient-to-br from-brand to-brand-2 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-all duration-200 hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
