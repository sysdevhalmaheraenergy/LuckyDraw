"use client";

import { Modal } from "./modal";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger" | "warning";
  loading?: boolean;
  error?: string;
  onConfirm: () => void;
}

const variantConfig = {
  default: {
    confirmClass: "bg-brand text-white hover:opacity-90",
  },
  danger: {
    confirmClass: "bg-danger text-white hover:bg-danger/90",
  },
  warning: {
    confirmClass: "bg-warning text-ink hover:bg-warning/90",
  },
};

export function ConfirmDialog({
  isOpen,
  onClose,
  title,
  message,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  variant = "default",
  loading = false,
  error,
  onConfirm,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-3">
        <p className="text-sm text-ink">{message}</p>
        {error && (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="flex-1 cursor-pointer rounded-lg border border-border/50 bg-white/30 px-4 py-2 text-sm font-semibold text-ink-muted transition-all duration-200 hover:bg-white/50 hover:text-ink disabled:opacity-40"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`flex-1 cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 disabled:opacity-40 ${config.confirmClass}`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-1.5">
              <svg
                className="-ml-1 h-3.5 w-3.5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Memproses...
            </span>
          ) : (
            confirmLabel
          )}
        </button>
      </div>
    </Modal>
  );
}
