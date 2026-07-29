"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DrawResultActionsProps {
  resultId: string;
  note: string | null;
  canUndo: boolean;
  onUndo: (resultId: string) => void;
  onEditNote: (resultId: string) => void;
  onViewNote: (resultId: string, note: string) => void;
}

export function DrawResultActions({
  resultId,
  note,
  canUndo,
  onUndo,
  onEditNote,
  onViewNote,
}: DrawResultActionsProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasNote = note && note.trim().length > 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Pilih aksi"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/50 bg-white/30 text-ink-muted opacity-70 backdrop-blur-xl transition-all duration-200 hover:opacity-100 hover:bg-white/50 hover:text-ink hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
          <path
            d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm-5 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm10 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-full z-[60] mt-1 w-48 rounded-xl border border-border/50 bg-surface/95 p-1 shadow-glass backdrop-blur-xl"
            role="menu"
          >
            {canUndo && (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onUndo(resultId);
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-warning transition-colors duration-200 hover:bg-warning/10"
              >
                Batalkan Pemenang
              </button>
            )}
            {!hasNote ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onEditNote(resultId);
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-ink transition-colors duration-200 hover:bg-brand/10"
              >
                Tambah Catatan
              </button>
            ) : (
              <>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    onViewNote(resultId, note);
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-ink transition-colors duration-200 hover:bg-brand/10"
                >
                  Lihat Catatan
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    onEditNote(resultId);
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-ink transition-colors duration-200 hover:bg-brand/10"
                >
                  Edit Catatan
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
