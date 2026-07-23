"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="cursor-pointer rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink-muted transition-colors duration-200 hover:border-red-400/40 hover:text-red-500"
    >
      Keluar
    </button>
  );
}
