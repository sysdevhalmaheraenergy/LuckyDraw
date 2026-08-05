"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface EventEditFormProps {
  eventId: string;
  initialName: string;
  initialDescription: string | null;
}

export function EventEditForm({ eventId, initialName, initialDescription }: EventEditFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setDescription(initialDescription ?? "");
      setError("");
    }
  }, [open, initialName, initialDescription]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: description || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal memperbarui event.");
      }

      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 cursor-pointer rounded-full border border-border/50 bg-white/20 px-4 py-2 text-sm font-semibold text-ink transition-all duration-200 hover:bg-white/30"
      >
        <PencilIcon />
        Edit Event
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-ink/40" />

          {/* Modal Panel */}
          <div className="relative z-10 w-full max-w-lg animate-fade-in rounded-2xl border border-border/50 bg-surface/95 p-6 shadow-card shadow-elevated backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold text-ink">Edit Event Details</h2>
                <p className="text-xs text-ink-muted">
                  Perbarui nama dan deskripsi event Anda
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="cursor-pointer rounded-full border border-border/50 bg-white/10 p-1.5 text-ink transition-all duration-200 hover:bg-white/20"
                aria-label="Close"
              >
                <XIcon />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label
                  htmlFor={`name-${eventId}`}
                  className="block text-sm font-semibold text-ink"
                >
                  Nama Event
                </label>
                <input
                  id={`name-${eventId}`}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Nama event"
                  className="mt-2 block w-full rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-ink outline-none transition-colors duration-200 placeholder:text-ink-muted/50 focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div>
                <label
                  htmlFor={`desc-${eventId}`}
                  className="block text-sm font-semibold text-ink"
                >
                  Deskripsi <span className="text-ink-muted">(opsional)</span>
                </label>
                <textarea
                  id={`desc-${eventId}`}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Deskripsi singkat tentang event ini..."
                  className="mt-2 block w-full resize-none rounded-xl border border-border bg-surface-alt px-4 py-2.5 text-sm text-ink outline-none transition-colors duration-200 placeholder:text-ink-muted/50 focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className="cursor-pointer rounded-full border border-border/50 bg-white/10 px-5 py-2 text-sm font-medium text-ink transition-all duration-200 hover:bg-white/20 disabled:opacity-40"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || !name.trim()}
                  className="cursor-pointer rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function PencilIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M11 5h2M7 19h.01M7 19h.01M7 19h10M7 19L7 13.5C7 13.13 7.13 12.77 7.38 12.5L16.12 4.5C17.26 3.47 19.04 3.9 19.5 5.34C19.83 6.34 19.4 7.44 18.38 8.38L9.87 16.35C9.63 16.58 9.3 16.81 8.92 16.97L6.73 17.86C6.52 17.94 6.28 17.94 6.07 17.86L4.5 17.27C4.25 17.17 4.03 16.95 3.96 16.69L3.81 15.94C3.73 15.56 3.8 15.17 4.03 14.87L7 11.97"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
