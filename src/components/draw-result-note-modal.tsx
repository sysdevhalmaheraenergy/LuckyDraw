"use client";

import { useState, useEffect } from "react";
import { Modal } from "./modal";

interface DrawResultNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  resultId: string;
  existingNote?: string;
  existingImageUrl?: string;
  onSuccess: () => void;
}

export function DrawResultNoteModal({
  isOpen,
  onClose,
  resultId,
  existingNote,
  existingImageUrl,
  onSuccess,
}: DrawResultNoteModalProps) {
  const [note, setNote] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setNote(existingNote ?? "");
      setImageUrl(existingImageUrl ?? "");
      setError("");
    }
  }, [isOpen, existingNote, existingImageUrl]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/upload/draw-results`, {
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
  };

  const handleRemoveImage = () => {
    setImageUrl("");
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/draw-results/${resultId}/note`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note: note.trim() || undefined,
          imageUrl: imageUrl || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal menyimpan catatan.");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === (e.currentTarget as HTMLElement)) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Catatan" size="md">
      <div className="space-y-4">
        {error && (
          <p className="rounded-md bg-danger/10 p-2 text-sm text-danger" role="alert">
            {error}
          </p>
        )}

        <div>
          <label
            htmlFor="note-input"
            className="block text-sm font-semibold text-ink"
          >
            Catatan
          </label>
          <textarea
            id="note-input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Tambahkan catatan untuk hasil undian ini..."
            rows={3}
            className="mt-2 block w-full resize-none rounded-xl border border-border/50 bg-white/50 px-4 py-2.5 text-sm text-ink outline-none transition-all duration-200 placeholder:text-ink-muted/50 focus:border-brand focus:ring-2 focus:ring-brand/20 backdrop-blur-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-ink">
            Gambar
          </label>

          {!imageUrl && (
            <div className="mt-2">
              <label
                htmlFor="image-upload"
                className="cursor-pointer rounded-xl border border-border/50 bg-white/50 px-4 py-2.5 text-sm font-semibold text-ink transition-all duration-200 hover:border-brand hover:bg-white/70"
              >
                {uploading ? "Mengunggah..." : "Pilih File"}
              </label>
              <input
                id="image-upload"
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                onChange={handleImageUpload}
                disabled={uploading}
                className="sr-only"
              />
            </div>
          )}

          {imageUrl && (
            <div className="mt-2 flex items-center gap-3">
              <div className="relative h-16 w-16 rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt="Preview gambar"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={uploading}
                className="rounded-lg px-2.5 py-1 text-xs font-semibold text-ink-muted transition-colors duration-200 hover:text-ink"
              >
                Ganti
              </button>
            </div>
          )}

          <p className="mt-1.5 text-xs text-ink-muted">
            Format: JPG, JPEG, PNG. Maksimal 500 KB.
          </p>
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={saving || uploading}
          className="flex-1 cursor-pointer rounded-lg border border-border/50 bg-white/30 px-4 py-2 text-sm font-semibold text-ink-muted transition-all duration-200 hover:bg-white/50 hover:text-ink disabled:opacity-40"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || uploading}
          className="flex-1 cursor-pointer rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-400 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:opacity-90 disabled:opacity-40"
        >
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </Modal>
  );
}