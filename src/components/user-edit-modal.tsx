"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/modal";
import { useToast } from "@/components/toast";

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  initialName: string;
  initialEmail: string;
  initialRole: string;
}

const roleOptions = [
  { value: "ADMIN", label: "Admin" },
  { value: "SUPERADMIN", label: "Super Admin" },
  { value: "STAFF", label: "Staff" },
];

export function UserEditModal({
  isOpen,
  onClose,
  userId,
  initialName,
  initialEmail,
  initialRole,
}: UserEditModalProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [role, setRole] = useState(initialRole);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const body: Record<string, unknown> = { name, email, role };
      if (password) body.password = password;

      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Gagal memperbarui pengguna.");
      }

      showToast("Pengguna berhasil diperbarui.", "success");
      onClose();
      router.refresh();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Terjadi kesalahan.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Pengguna: ${initialName}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-ink">
            Nama
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-2 block w-full rounded-xl border border-border/50 bg-white/50 px-4 py-2.5 text-sm text-ink outline-none transition-all duration-200 placeholder:text-ink-muted/50 focus:border-brand focus:ring-2 focus:ring-brand/20 backdrop-blur-sm"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-ink">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-2 block w-full rounded-xl border border-border/50 bg-white/50 px-4 py-2.5 text-sm text-ink outline-none transition-all duration-200 placeholder:text-ink-muted/50 focus:border-brand focus:ring-2 focus:ring-brand/20 backdrop-blur-sm"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-semibold text-ink">
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-2 block w-full rounded-xl border border-border/50 bg-white/50 px-4 py-2.5 text-sm text-ink outline-none transition-all duration-200 focus:border-brand focus:ring-2 focus:ring-brand/20 backdrop-blur-sm"
          >
            {roleOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-ink">
            Password Baru <span className="text-ink-muted">(opsional)</span>
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            className="mt-2 block w-full rounded-xl border border-border/50 bg-white/50 px-4 py-2.5 text-sm text-ink outline-none transition-all duration-200 placeholder:text-ink-muted/50 focus:border-brand focus:ring-2 focus:ring-brand/20 backdrop-blur-sm"
            placeholder="Kosongkan jika tidak ingin mengganti"
          />
          <p className="mt-1.5 text-xs text-ink-muted">
            Minimal 8 karakter. Kosongkan jika tidak ingin mengganti password.
          </p>
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
            type="submit"
            disabled={saving || !name.trim() || !email.trim()}
            className="flex-1 cursor-pointer rounded-lg bg-gradient-to-br from-brand to-brand-2 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-all duration-200 hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
