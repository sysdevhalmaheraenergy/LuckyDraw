"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

export default function NewPrizePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [drawOrder, setDrawOrder] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/events/${id}/prizes`, {
        method: "POST",
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
        throw new Error(data.error ?? "Gagal menambah hadiah.");
      }

      router.push(`/dashboard/events/${id}`);
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
            href={id ? `/dashboard/events/${id}` : "/dashboard"}
            className="cursor-pointer rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-surface-alt"
          >
            Kembali
          </Link>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-lg">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Tambah Hadiah
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Isi detail hadiah yang akan diundi.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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
                placeholder="Deskripsi hadiah..."
                className="mt-2 block w-full resize-none rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-ink outline-none transition-colors duration-200 placeholder:text-ink-muted/50 focus:border-brand focus:ring-2 focus:ring-brand/20"
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
                     // Step 1: Request signed URL from /api/uploads/presign
                     const presignRes = await fetch("/api/uploads/presign", {
                       method: "POST",
                       headers: { "Content-Type": "application/json" },
                       body: JSON.stringify({
                         fileName: file.name,
                         contentType: file.type,
                       }),
                     });

                     if (!presignRes.ok) {
                       const data = await presignRes.json();
                       throw new Error(data.error ?? "Gagal meminta URL unggah.");
                     }

                     const { uploadUrl, path } = await presignRes.json();

                     // Step 2: Upload file directly to Firebase Storage via PUT
                     const putRes = await fetch(uploadUrl, {
                       method: "PUT",
                       headers: { "Content-Type": file.type },
                       body: file,
                     });

                     if (!putRes.ok) {
                       throw new Error("Gagal mengunggah file ke penyimpanan.");
                     }

                     // Step 3: Finalize upload to get permanent public URL
                     const finalizeRes = await fetch("/api/uploads/finalize", {
                       method: "POST",
                       headers: { "Content-Type": "application/json" },
                       body: JSON.stringify({ path }),
                     });

                     if (!finalizeRes.ok) {
                       const data = await finalizeRes.json();
                       throw new Error(data.error ?? "Gagal memfinalisasi gambar.");
                     }

                     const { url } = await finalizeRes.json();
                     setImageUrl(url);
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
                  className="mt-2 h-32 w-full rounded-xl object-cover"
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
                className="mt-2 block w-full rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-ink outline-none transition-colors duration-200 focus:border-brand focus:ring-2 focus:ring-brand/20"
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
              disabled={loading || uploading || !name.trim() || !id}
              className="w-full cursor-pointer rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Menyimpan..." : "Tambah Hadiah"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}