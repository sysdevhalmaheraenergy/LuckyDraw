"use client";

import { useState, useEffect } from "react";
import { Modal } from "./modal";
import { useToast } from "./toast";

interface DrawResultNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  resultId: string;
  existingNote?: string;
  onSuccess: () => void;
}

export function DrawResultNoteModal({
  isOpen,
  onClose,
  resultId,
  existingNote,
  onSuccess,
}: DrawResultNoteModalProps) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setNote(existingNote ?? "");
      setError("");
    }
  }, [isOpen, existingNote]);

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/draw-results/${resultId}/note`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          note: note.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal menyimpan catatan.");
      }

      onSuccess();
      showToast("Catatan berhasil disimpan.", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existingNote ? "Edit Catatan" : "Tambah Catatan"} size="md">
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
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="flex-1 cursor-pointer rounded-lg border border-border/50 bg-white/30 px-4 py-2 text-sm font-semibold text-ink-muted transition-all duration-200 hover:bg-white/50 hover:text-ink disabled:opacity-40"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex-1 cursor-pointer rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-400 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all duration-200 hover:opacity-90 disabled:opacity-40"
        >
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>
    </Modal>
  );
}