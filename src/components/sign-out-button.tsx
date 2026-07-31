"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: window.location.origin + "/login" })}
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-white/50 hover:text-red-500"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
        <path
          d="M16 13v-2H7V8l-5 4 5 4V12h9ZM20 3H4v2h16V3Zm0 18H4v2h16v-2Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Keluar
    </button>
  );
}
